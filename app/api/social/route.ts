import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { getSessionLoose } from "@/lib/authLoose";
import { readRole } from "@/lib/session";

type Item = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  postedAt: string;
  teamSlug?: string | null;
};
type ListOut = { items: Item[]; total: number; page: number; pageSize: number };
type CreateOut = { ok: boolean; item?: Item; reason?: string | null };

const CANDIDATES = ["news", "updates", "post", "social"] as const;

function camel(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}
function getModel() {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const key of CANDIDATES) {
    const m = map.get(key);
    if (m) return m;
  }
  return null;
}
function getDelegate(modelName: string) {
  const key = camel(modelName);
  return (prisma as unknown as Record<string, unknown>)[key] as unknown;
}
function has(o: unknown, k: string): boolean {
  return !!(o && typeof o === "object" && k in (o as object));
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
function logPath(): string {
  const dir = "/tmp";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "social.log.jsonl");
}

export async function GET(req: Request, _ctx: unknown): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") || "20")));
  const team = url.searchParams.get("team") || "";

  const meta = getModel();
  if (!meta) {
    const file = logPath();
    if (!fs.existsSync(file)) return NextResponse.json({ items: [], total: 0, page, pageSize } as ListOut, { status: 200 });
    const lines = fs.readFileSync(file, "utf8").split("\n").filter((l) => l.trim().length > 0);
    const all = lines.map((l) => {
      try {
        const o = JSON.parse(l) as Record<string, unknown>;
        return {
          id: normId(o.id ?? o._id ?? ""),
          type: typeof o.type === "string" ? o.type : "Social",
          title: typeof o.title === "string" ? o.title : "",
          body: typeof o.body === "string" ? o.body : null,
          postedAt: iso(o.postedAt ?? o.ts ?? new Date().toISOString()),
          teamSlug: typeof o.teamSlug === "string" ? o.teamSlug : null,
        } as Item;
      } catch {
        return null;
      }
    }).filter((x): x is Item => !!x);
    const filtered = team ? all.filter((x) => (x.teamSlug || "") === team) : all;
    filtered.sort((a, b) => (a.postedAt < b.postedAt ? 1 : a.postedAt > b.postedAt ? -1 : 0));
    return NextResponse.json({ items: filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), total: filtered.length, page, pageSize } as ListOut, { status: 200 });
  }

  const fields = new Set(meta.fields.map((f) => f.name));
  const d = getDelegate(meta.name) as { findMany?: (a: unknown) => Promise<unknown[]>; count?: (a: unknown) => Promise<number> };

  const where: Record<string, unknown> = {};
  if (team) {
    if (fields.has("teamSlug")) where["teamSlug"] = team;
    else if (fields.has("teamId")) where["teamId"] = team;
  }

  const select: Record<string, true> = {};
  ["id", "type", "title", "body", "postedAt", "teamSlug"].forEach((k) => {
    if (fields.has(k)) (select as Record<string, true>)[k] = true;
  });
  const minimal: Record<string, true> = {};
  if (fields.has("id")) (minimal as Record<string, true>)["id"] = true;

  let rows: unknown[] = [];
  let total = 0;
  try {
    if (has(d, "findMany")) {
      try {
        rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
          where,
          take: pageSize,
          skip: (page - 1) * pageSize,
          orderBy: fields.has("postedAt") ? { postedAt: "desc" } : undefined,
          select: Object.keys(select).length ? select : minimal,
        });
      } catch {
        rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
          where,
          take: pageSize,
          skip: (page - 1) * pageSize,
          select: Object.keys(select).length ? select : minimal,
        });
      }
      try {
        total = has(d, "count") ? await (d.count as (a: unknown) => Promise<number>)({ where }) : rows.length;
      } catch {
        total = rows.length;
      }
    }
  } catch {
    rows = [];
    total = 0;
  }

  const items: Item[] = (rows as Record<string, unknown>[]).map((r) => ({
    id: normId(r.id),
    type: typeof r.type === "string" ? r.type : "Social",
    title: typeof r.title === "string" ? r.title : "",
    body: typeof r.body === "string" ? r.body : null,
    postedAt: iso(r.postedAt ?? r.createdAt ?? new Date().toISOString()),
    ...(fields.has("teamSlug") ? { teamSlug: typeof r.teamSlug === "string" ? r.teamSlug : null } : {}),
  }));

  return NextResponse.json({ items, total, page, pageSize } as ListOut, { status: 200 });
}

export async function POST(req: Request, _ctx: unknown): Promise<Response> {
  const isPreview = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "preview";
  const allowLocal = process.env.NODE_ENV !== "production" && process.env.ALLOW_LOCAL_PREVIEW_SEED === "true";

  try {
    const s = await getSessionLoose();
    const role = readRole(s);
    if (!s || !s.user || role !== "admin") {
      return NextResponse.json({ ok: false, reason: "unauthorized" } as CreateOut, { status: 200 });
    }
  } catch {
    return NextResponse.json({ ok: false, reason: "unauthorized" } as CreateOut, { status: 200 });
  }

  if (!isPreview && !allowLocal) {
    return NextResponse.json({ ok: false, reason: "not-allowed" } as CreateOut, { status: 200 });
  }

  let body: Record<string, unknown> = {};
  try {
    const json = await req.json();
    body = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) || {};
  } catch {
    body = {};
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "Social";
  const teamSlug = typeof body.teamSlug === "string" ? body.teamSlug.trim() : null;

  if (!title) return NextResponse.json({ ok: false, reason: "missing-title" } as CreateOut, { status: 200 });

  const meta = getModel();
  if (!meta) {
    const file = logPath();
    const entry = {
      id: `${Date.now()}`,
      type,
      title,
      body: text || null,
      postedAt: new Date().toISOString(),
      teamSlug,
    };
    try {
      fs.appendFileSync(file, JSON.stringify(entry) + "\n");
      return NextResponse.json({ ok: true, item: entry as Item } as CreateOut, { status: 200 });
    } catch {
      return NextResponse.json({ ok: false, reason: "log-failed" } as CreateOut, { status: 200 });
    }
  }

  const fields = new Set(meta.fields.map((f) => f.name));
  const d = getDelegate(meta.name) as { create?: (a: unknown) => Promise<unknown> };

  const data: Record<string, unknown> = {};
  if (fields.has("title")) data.title = title;
  if (fields.has("body")) data.body = text || null;
  if (fields.has("type")) data.type = type;
  if (fields.has("postedAt")) data.postedAt = new Date();
  if (fields.has("teamSlug") && teamSlug) data.teamSlug = teamSlug;

  const select: Record<string, true> = {};
  ["id", "title", "body", "type", "postedAt", "teamSlug"].forEach((k) => {
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
        const item: Item = {
          id: normId(r.id),
          title: typeof r.title === "string" ? r.title : title,
          body: typeof r.body === "string" ? r.body : (text || null),
          type: typeof r.type === "string" ? r.type : type,
          postedAt: iso(r.postedAt ?? r.createdAt ?? new Date().toISOString()),
          ...(fields.has("teamSlug") ? { teamSlug: typeof r.teamSlug === "string" ? r.teamSlug : (teamSlug ?? null) } : {}),
        };
        return NextResponse.json({ ok: true, item } as CreateOut, { status: 200 });
      } catch {
        try {
          const created = await (d.create as (a: unknown) => Promise<unknown>)({
            data: {},
            select: minimal,
          });
          const r = created as Record<string, unknown>;
          const item: Item = {
            id: normId(r.id),
            title,
            body: text || null,
            type,
            postedAt: new Date().toISOString(),
            ...(teamSlug ? { teamSlug } : {}),
          };
          return NextResponse.json({ ok: true, item } as CreateOut, { status: 200 });
        } catch {
          const file = logPath();
          const entry = {
            id: `${Date.now()}`,
            type,
            title,
            body: text || null,
            postedAt: new Date().toISOString(),
            teamSlug,
          };
          try {
            fs.appendFileSync(file, JSON.stringify(entry) + "\n");
            return NextResponse.json({ ok: true, item: entry as Item } as CreateOut, { status: 200 });
          } catch {
            return NextResponse.json({ ok: false, reason: "create-failed" } as CreateOut, { status: 200 });
          }
        }
      }
    }
  } catch {
    const file = logPath();
    const entry = {
      id: `${Date.now()}`,
      type,
      title,
      body: text || null,
      postedAt: new Date().toISOString(),
      teamSlug,
    };
    try {
      fs.appendFileSync(file, JSON.stringify(entry) + "\n");
      return NextResponse.json({ ok: true, item: entry as Item } as CreateOut, { status: 200 });
    } catch {
      return NextResponse.json({ ok: false, reason: "no-delegate" } as CreateOut, { status: 200 });
    }
  }

  return NextResponse.json({ ok: false, reason: "no-delegate" } as CreateOut, { status: 200 });
}
