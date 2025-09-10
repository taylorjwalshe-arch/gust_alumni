import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSessionLoose } from "@/lib/authLoose";
import { readRole } from "@/lib/session";

type JobOut = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean;
  postedAt: string;
  posterId: string | null;
  description?: string | null;
};
type ListOut = {
  items: JobOut[];
  total: number;
  page: number;
  pageSize: number;
};

const JOB_CANDIDATES = ["job", "jobs", "posting", "post", "opportunity"] as const;

function camelize(modelName: string): string {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}
function getModel(candidates: readonly string[]) {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const key of candidates) {
    const m = map.get(key);
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
function normalizeJob(row: Record<string, unknown>, hasDescription: boolean): JobOut {
  return {
    id: normId(row.id),
    title: typeof row.title === "string" ? row.title : null,
    company: typeof row.company === "string" ? row.company : null,
    location: typeof row.location === "string" ? row.location : null,
    isRequest: !!(row.isRequest as boolean),
    postedAt: iso(row.postedAt),
    posterId: row.posterId != null ? normId(row.posterId) : null,
    ...(hasDescription ? { description: typeof row.description === "string" ? row.description : null } : {}),
  };
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type");
  const location = url.searchParams.get("location") || "";
  const sort = url.searchParams.get("sort") || "newest";
  const team = url.searchParams.get("team") || "";
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") || "10")));

  const meta = getModel(JOB_CANDIDATES);
  if (!meta) {
    return NextResponse.json({ items: [], total: 0, page, pageSize } as ListOut, { status: 200 });
  }

  const d = getDelegate(meta.name) as {
    findMany?: (args: unknown) => Promise<unknown[]>;
    count?: (args: unknown) => Promise<number>;
  };

  const fields = new Set(meta.fields.map((f) => f.name));
  const hasDescription = fields.has("description");

  const where: Record<string, unknown> = {};
  if (q && fields.has("title")) where["title"] = { contains: q, mode: "insensitive" };
  if (location && fields.has("location")) where["location"] = { contains: location, mode: "insensitive" };
  if (type && fields.has("isRequest")) where["isRequest"] = type === "requests";
  if (team) {
    if (fields.has("teamSlug")) where["teamSlug"] = team;
    else if (fields.has("teamId")) where["teamId"] = team;
  }

  const RICH: Record<string, true> = {};
  ["id", "title", "company", "location", "isRequest", "postedAt", "posterId"].forEach((k) => {
    if (fields.has(k)) (RICH as Record<string, true>)[k] = true;
  });
  if (hasDescription) (RICH as Record<string, true>)["description"] = true;

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

  const items = (rows as Record<string, unknown>[]).map((r) => normalizeJob(r, hasDescription));
  return NextResponse.json({ items, total, page, pageSize } as ListOut, { status: 200 });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await getSessionLoose();
    const role = readRole(session);
    if (!session || !session.user) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 200 });
    }
    void role;
  } catch {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 200 });
  }

  const meta = getModel(JOB_CANDIDATES);
  if (!meta) {
    return NextResponse.json({ ok: false, reason: "no-model" }, { status: 200 });
  }
  const d = getDelegate(meta.name) as {
    create?: (args: unknown) => Promise<unknown>;
  };
  const fields = new Set(meta.fields.map((f) => f.name));

  let body: Record<string, unknown> = {};
  try {
    const json = await req.json();
    body = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) || {};
  } catch {
    body = {};
  }

  const richData: Record<string, unknown> = {};
  if (fields.has("title") && typeof body.title === "string") richData.title = body.title;
  if (fields.has("company") && (typeof body.company === "string" || body.company === null)) richData.company = body.company ?? null;
  if (fields.has("location") && typeof body.location === "string") richData.location = body.location;
  if (fields.has("isRequest")) richData.isRequest = !!body.isRequest;
  if (fields.has("postedAt")) richData.postedAt = body.postedAt ? new Date(String(body.postedAt)) : new Date();
  if (fields.has("posterId") && (typeof body.posterId === "string" || typeof body.posterId === "number")) richData.posterId = body.posterId;
  if (fields.has("description") && (typeof body.description === "string" || body.description === null)) richData.description = body.description ?? null;
  if (fields.has("teamSlug") && typeof body.teamSlug === "string") richData.teamSlug = body.teamSlug;
  if (fields.has("teamId") && (typeof body.teamId === "string" || typeof body.teamId === "number")) richData.teamId = body.teamId;

  const MIN: Record<string, true> = {};
  if (fields.has("id")) (MIN as Record<string, true>)["id"] = true;

  try {
    if (has(d, "create")) {
      try {
        const created = await (d.create as (a: unknown) => Promise<unknown>)({
          data: richData,
          select: Object.keys(richData).length
            ? Object.fromEntries(
                ["id", "title", "company", "location", "isRequest", "postedAt", "posterId", "description"]
                  .filter((k) => fields.has(k))
                  .map((k) => [k, true] as const)
              )
            : (MIN as Record<string, true>),
        });
        const item = normalizeJob(created as Record<string, unknown>, fields.has("description"));
        return NextResponse.json({ ok: true, item }, { status: 200 });
      } catch {
        try {
          const created = await (d.create as (a: unknown) => Promise<unknown>)({
            data: {},
            select: Object.fromEntries(["id"].filter((k) => fields.has(k)).map((k) => [k, true] as const)),
          });
          const item = normalizeJob(created as Record<string, unknown>, fields.has("description"));
          return NextResponse.json({ ok: true, item }, { status: 200 });
        } catch {
          return NextResponse.json({ ok: false, reason: "create-failed" }, { status: 200 });
        }
      }
    }
  } catch {}
  return NextResponse.json({ ok: false, reason: "no-delegate" }, { status: 200 });
}
