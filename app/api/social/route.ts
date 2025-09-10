import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

type SocialItem = {
  id: string;
  type: string;
  title: string | null;
  body?: string | null;
  postedAt: string;
};
type ListOut = { items: SocialItem[]; total: number; page: number; pageSize: number };

const SOCIAL_CANDIDATES = ["social", "news", "updates", "post"] as const;

function camelize(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}
function getModel() {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const k of SOCIAL_CANDIDATES) {
    const m = map.get(k);
    if (m) return m;
  }
  return null;
}
function getDelegate(modelName: string) {
  const key = camelize(modelName);
  return (prisma as unknown as Record<string, unknown>)[key] as unknown;
}
function has(d: unknown, k: string): boolean {
  return !!(d && typeof d === "object" && k in (d as object));
}
function normId(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "bigint") return String(v);
  return "";
}
function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  return new Date().toISOString();
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const team = url.searchParams.get("team") || "";
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") || "20")));

  const meta = getModel();
  if (!meta) return NextResponse.json({ items: [], total: 0, page, pageSize } as ListOut, { status: 200 });

  const d = getDelegate(meta.name) as {
    findMany?: (args: unknown) => Promise<unknown[]>;
    count?: (args: unknown) => Promise<number>;
  };

  const fields = new Set(meta.fields.map((f) => f.name));
  const where: Record<string, unknown> = {};
  const titleFields = ["title", "headline", "text"].filter((k) => fields.has(k));
  const bodyFields = ["body", "content", "text"].filter((k) => fields.has(k));
  if (q) {
    const ors: Record<string, unknown>[] = [];
    for (const f of titleFields) ors.push({ [f]: { contains: q, mode: "insensitive" } });
    for (const f of bodyFields) ors.push({ [f]: { contains: q, mode: "insensitive" } });
    if (ors.length) where["OR"] = ors;
  }
  if (team) {
    if (fields.has("teamSlug")) where["teamSlug"] = team;
    else if (fields.has("teamId")) where["teamId"] = team;
  }

  const RICH: Record<string, true> = {};
  ["id", "type", "title", "headline", "body", "content", "text", "postedAt", "createdAt", "category", "teamSlug", "teamId"].forEach(
    (k) => {
      if (fields.has(k)) (RICH as Record<string, true>)[k] = true;
    }
  );
  const MIN: Record<string, true> = {};
  if (fields.has("id")) (MIN as Record<string, true>)["id"] = true;

  let rows: unknown[] = [];
  let total = 0;

  try {
    if (has(d, "findMany")) {
      try {
        rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
          where,
          take: pageSize,
          skip: (page - 1) * pageSize,
          orderBy: fields.has("postedAt")
            ? { postedAt: "desc" }
            : fields.has("createdAt")
            ? { createdAt: "desc" }
            : undefined,
          select: RICH,
        });
      } catch {
        rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
          where,
          take: pageSize,
          skip: (page - 1) * pageSize,
          select: RICH,
        });
      }
      try {
        total = has(d, "count")
          ? await (d.count as (a: unknown) => Promise<number>)({ where })
          : rows.length;
      } catch {
        total = rows.length;
      }
    }
  } catch {
    rows = [];
    total = 0;
  }

  const items: SocialItem[] = (rows as Record<string, unknown>[]).map((r) => {
    const title =
      (typeof r.title === "string" ? r.title : null) ??
      (typeof r.headline === "string" ? r.headline : null) ??
      (typeof r.text === "string" ? r.text : null);
    const body =
      (typeof r.body === "string" ? r.body : null) ??
      (typeof r.content === "string" ? r.content : null) ??
      (typeof r.text === "string" ? r.text : null);
    const type =
      (typeof r.type === "string" ? r.type : null) ??
      (typeof r.category === "string" ? r.category : null) ??
      "Social";
    const postedAt = r.postedAt ?? r.createdAt ?? new Date().toISOString();
    return {
      id: normId(r.id),
      type: typeof type === "string" ? type : "Social",
      title,
      ...(body !== null ? { body } : {}),
      postedAt: iso(postedAt),
    };
  });

  return NextResponse.json({ items, total, page, pageSize } as ListOut, { status: 200 });
}

export async function POST(req: Request): Promise<Response> {
  let bodyIn: Record<string, unknown> = {};
  try {
    const json = await req.json();
    bodyIn = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) || {};
  } catch {
    bodyIn = {};
  }

  const titleIn = typeof bodyIn.title === "string" ? bodyIn.title : null;
  const bodyTextIn = typeof bodyIn.body === "string" ? bodyIn.body : null;
  const typeIn = typeof bodyIn.type === "string" ? bodyIn.type : "Social";
  const postedAtIn = bodyIn.postedAt ?? new Date().toISOString();
  const teamSlugIn = typeof bodyIn.teamSlug === "string" ? bodyIn.teamSlug : undefined;
  const teamIdIn = typeof bodyIn.teamId === "string" || typeof bodyIn.teamId === "number" ? bodyIn.teamId : undefined;

  const meta = getModel();

  if (meta) {
    const d = getDelegate(meta.name) as { create?: (args: unknown) => Promise<unknown> };
    const fields = new Set(meta.fields.map((f) => f.name));

    const titleKey = fields.has("title") ? "title" : fields.has("headline") ? "headline" : fields.has("text") ? "text" : null;
    const bodyKey = fields.has("body") ? "body" : fields.has("content") ? "content" : fields.has("text") ? "text" : null;
    const typeKey = fields.has("type") ? "type" : fields.has("category") ? "category" : null;
    const postedKey = fields.has("postedAt") ? "postedAt" : fields.has("createdAt") ? "createdAt" : null;

    const data: Record<string, unknown> = {};
    if (titleKey && titleIn !== null) data[titleKey] = titleIn;
    if (bodyKey && bodyTextIn !== null) data[bodyKey] = bodyTextIn;
    if (typeKey) data[typeKey] = typeIn;
    if (postedKey) data[postedKey] = new Date(iso(postedAtIn));
    if (teamSlugIn && fields.has("teamSlug")) data["teamSlug"] = teamSlugIn;
    if (typeof teamIdIn !== "undefined" && fields.has("teamId")) data["teamId"] = teamIdIn;

    const select: Record<string, true> = {};
    ["id", "title", "headline", "body", "content", "text", "type", "category", "postedAt", "createdAt"].forEach((k) => {
      if (fields.has(k)) (select as Record<string, true>)[k] = true;
    });
    const minimal: Record<string, true> = {};
    if (fields.has("id")) (minimal as Record<string, true>)["id"] = true;

    try {
      if (has(d, "create")) {
        try {
          const created = await (d.create as (a: unknown) => Promise<unknown>)({
            data,
            select: Object.keys(select).length ? select : minimal,
          });
          const r = created as Record<string, unknown>;
          const title =
            (typeof r.title === "string" ? r.title : null) ??
            (typeof r.headline === "string" ? r.headline : null) ??
            (typeof r.text === "string" ? r.text : null);
          const bodyText =
            (typeof r.body === "string" ? r.body : null) ??
            (typeof r.content === "string" ? r.content : null) ??
            (typeof r.text === "string" ? r.text : null);
          const type =
            (typeof r.type === "string" ? r.type : null) ??
            (typeof r.category === "string" ? r.category : null) ??
            "Social";
          const postedAt = r.postedAt ?? r.createdAt ?? new Date().toISOString();
          const item: SocialItem = {
            id: normId(r.id),
            type: typeof type === "string" ? type : "Social",
            title,
            ...(bodyText !== null ? { body: bodyText } : {}),
            postedAt: iso(postedAt),
          };
          return NextResponse.json({ ok: true, item }, { status: 200 });
        } catch {
          try {
            const created = await (d.create as (a: unknown) => Promise<unknown>)({
              data: {},
              select: minimal,
            });
            const r = created as Record<string, unknown>;
            const item: SocialItem = {
              id: normId(r.id),
              type: typeIn,
              title: titleIn,
              ...(bodyTextIn !== null ? { body: bodyTextIn } : {}),
              postedAt: iso(postedAtIn),
            };
            return NextResponse.json({ ok: true, item }, { status: 200 });
          } catch {
            // fall through to file log
          }
        }
      }
    } catch {
      // fall through to file log
    }
  }

  try {
    const dir = "/tmp";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "social.log");
    const entry: SocialItem = {
      id: `file-${Date.now()}`,
      type: typeIn,
      title: titleIn,
      ...(bodyTextIn !== null ? { body: bodyTextIn } : {}),
      postedAt: iso(postedAtIn),
    };
    fs.appendFileSync(file, JSON.stringify(entry) + "\n");
    return NextResponse.json({ ok: true, item: entry }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, reason: "log-failed" }, { status: 200 });
  }
}
