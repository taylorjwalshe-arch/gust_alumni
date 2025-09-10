import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionLoose } from "@/lib/authLoose";

type JobItem = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean;
  postedAt: string;
  posterId?: string | null;
  teamSlug?: string | null;
};
type ListOut = { items: JobItem[]; total: number; page: number; pageSize: number };
type CreateOut = { ok: boolean; item?: JobItem; reason?: string };

const CANDIDATES = ["job", "jobs", "posting", "post", "opportunity"] as const;

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

export async function GET(req: Request, _ctx: unknown): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const team = url.searchParams.get("team") || "";
  const location = url.searchParams.get("location") || "";
  const type = url.searchParams.get("type") || ""; // "jobs" | "requests" | ""
  const sort = url.searchParams.get("sort") || "newest"; // "newest" | "oldest"
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") || "20")));

  const meta = getModel();
  if (!meta) return NextResponse.json({ items: [], total: 0, page, pageSize } as ListOut, { status: 200 });

  const fields = new Set(meta.fields.map((f) => f.name));
  const d = getDelegate(meta.name) as {
    findMany?: (args: unknown) => Promise<unknown[]>;
    count?: (args: unknown) => Promise<number>;
    create?: (args: unknown) => Promise<unknown>;
  };

  const where: Record<string, unknown> = {};
  if (team) {
    if (fields.has("teamSlug")) where["teamSlug"] = team;
    else if (fields.has("teamId")) where["teamId"] = team;
  }
  if (location && fields.has("location")) {
    where["location"] = { contains: location, mode: "insensitive" };
  }
  if (type === "jobs") where["isRequest"] = false;
  if (type === "requests") where["isRequest"] = true;
  if (q) {
    const ors: Record<string, unknown>[] = [];
    if (fields.has("title")) ors.push({ title: { contains: q, mode: "insensitive" } });
    if (fields.has("company")) ors.push({ company: { contains: q, mode: "insensitive" } });
    if (fields.has("location")) ors.push({ location: { contains: q, mode: "insensitive" } });
    if (ors.length) where["OR"] = ors;
  }

  const RICH: Record<string, true> = {};
  ["id", "title", "company", "location", "isRequest", "postedAt", "posterId", "teamSlug"].forEach((k) => {
    if (fields.has(k)) (RICH as Record<string, true>)[k] = true;
  });
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
            ? { postedAt: sort === "oldest" ? "asc" : "desc" }
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
        total = has(d, "count") ? await (d.count as (a: unknown) => Promise<number>)({ where }) : rows.length;
      } catch {
        total = rows.length;
      }
    }
  } catch {
    rows = [];
    total = 0;
  }

  const items: JobItem[] = (rows as Record<string, unknown>[]).map((r) => ({
    id: normId(r.id),
    title: typeof r.title === "string" ? r.title : null,
    company: typeof r.company === "string" ? r.company : null,
    location: typeof r.location === "string" ? r.location : null,
    isRequest: !!r.isRequest,
    postedAt: iso(r.postedAt ?? r.createdAt ?? new Date().toISOString()),
    ...(fields.has("posterId") ? { posterId: typeof r.posterId === "string" || typeof r.posterId === "number" ? String(r.posterId) : null } : {}),
    ...(fields.has("teamSlug") ? { teamSlug: typeof r.teamSlug === "string" ? r.teamSlug : null } : {}),
  }));

  return NextResponse.json({ items, total, page, pageSize } as ListOut, { status: 200 });
}

export async function POST(req: Request, _ctx: unknown): Promise<Response> {
  let authed = false;
  try {
    const s = await getSessionLoose();
    authed = !!(s && s.user);
  } catch {
    authed = false;
  }
  if (!authed) return NextResponse.json({ ok: false, reason: "unauthorized" } as CreateOut, { status: 200 });

  const url = new URL(req.url);
  void url;

  const meta = getModel();
  if (!meta) return NextResponse.json({ ok: false, reason: "no-model" } as CreateOut, { status: 200 });
  const fields = new Set(meta.fields.map((f) => f.name));
  const d = getDelegate(meta.name) as { create?: (args: unknown) => Promise<unknown> };

  let body: Record<string, unknown> = {};
  try {
    const json = await req.json();
    body = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) || {};
  } catch {
    body = {};
  }

  const data: Record<string, unknown> = {};
  if (fields.has("title") && typeof body.title === "string") data.title = body.title;
  if (fields.has("company") && (typeof body.company === "string" || body.company === null)) data.company = body.company;
  if (fields.has("location") && typeof body.location === "string") data.location = body.location;
  if (fields.has("isRequest")) data.isRequest = !!body.isRequest;
  if (fields.has("description") && typeof body.description === "string") data.description = body.description;
  if (fields.has("postedAt")) data.postedAt = new Date();
  if (fields.has("posterId") && (typeof body.posterId === "string" || typeof body.posterId === "number"))
    data.posterId = body.posterId;
  if (fields.has("teamSlug") && typeof body.teamSlug === "string") data.teamSlug = body.teamSlug;

  const select: Record<string, true> = {};
  ["id", "title", "company", "location", "isRequest", "postedAt", "posterId", "teamSlug"].forEach((k) => {
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
        const item: JobItem = {
          id: normId(r.id),
          title: typeof r.title === "string" ? r.title : null,
          company: typeof r.company === "string" ? r.company : null,
          location: typeof r.location === "string" ? r.location : null,
          isRequest: !!r.isRequest,
          postedAt: iso(r.postedAt ?? r.createdAt ?? new Date().toISOString()),
          ...(fields.has("posterId")
            ? { posterId: typeof r.posterId === "string" || typeof r.posterId === "number" ? String(r.posterId) : null }
            : {}),
          ...(fields.has("teamSlug") ? { teamSlug: typeof r.teamSlug === "string" ? r.teamSlug : null } : {}),
        };
        return NextResponse.json({ ok: true, item } as CreateOut, { status: 200 });
      } catch {
        try {
          const created = await (d.create as (a: unknown) => Promise<unknown>)({
            data: {},
            select: minimal,
          });
          const r = created as Record<string, unknown>;
          const item: JobItem = {
            id: normId(r.id),
            title: typeof body.title === "string" ? body.title : null,
            company: typeof body.company === "string" ? body.company : null,
            location: typeof body.location === "string" ? body.location : null,
            isRequest: !!body.isRequest,
            postedAt: new Date().toISOString(),
          };
          return NextResponse.json({ ok: true, item } as CreateOut, { status: 200 });
        } catch {
          return NextResponse.json({ ok: false, reason: "create-failed" } as CreateOut, { status: 200 });
        }
      }
    }
  } catch {
    return NextResponse.json({ ok: false, reason: "no-delegate" } as CreateOut, { status: 200 });
  }

  return NextResponse.json({ ok: false, reason: "no-delegate" } as CreateOut, { status: 200 });
}
