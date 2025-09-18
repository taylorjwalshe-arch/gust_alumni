import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type PersonItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  location: string | null;
  teamSlug?: string | null;
};
type ListOut = { items: PersonItem[]; total: number; page: number; pageSize: number };

const CANDIDATES = ["person", "people", "alumni", "user", "member"] as const;

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

export async function GET(req: Request, _ctx: unknown): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const team = url.searchParams.get("team") || "";
  const location = url.searchParams.get("location") || "";
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") || "20")));

  const meta = getModel();
  if (!meta) return NextResponse.json({ items: [], total: 0, page, pageSize } as ListOut, { status: 200 });

  const fields = new Set(meta.fields.map((f) => f.name));
  const d = getDelegate(meta.name) as {
    findMany?: (args: unknown) => Promise<unknown[]>;
    count?: (args: unknown) => Promise<number>;
  };

  const where: Record<string, unknown> = {};
  if (team) {
    if (fields.has("teamSlug")) where["teamSlug"] = team;
    else if (fields.has("teamId")) where["teamId"] = team;
  }
  if (location && fields.has("location")) {
    where["location"] = { contains: location, mode: "insensitive" };
  }
  if (q) {
    const ors: Record<string, unknown>[] = [];
    if (fields.has("firstName")) ors.push({ firstName: { contains: q, mode: "insensitive" } });
    if (fields.has("lastName")) ors.push({ lastName: { contains: q, mode: "insensitive" } });
    if (fields.has("email")) ors.push({ email: { contains: q, mode: "insensitive" } });
    if (fields.has("industries")) ors.push({ industries: { has: q } });
    if (ors.length) where["OR"] = ors;
  }

  const RICH: Record<string, true> = {};
  ["id", "firstName", "lastName", "industries", "location", "teamSlug"].forEach((k) => {
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
          orderBy: fields.has("lastName") ? { lastName: "asc" } : undefined,
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

  const items: PersonItem[] = (rows as Record<string, unknown>[]).map((r) => ({
    id: normId(r.id),
    firstName: typeof r.firstName === "string" ? r.firstName : null,
    lastName: typeof r.lastName === "string" ? r.lastName : null,
    industries: Array.isArray(r.industries)
      ? (r.industries as unknown[]).filter((x): x is string => typeof x === "string")
      : null,
    location: typeof r.location === "string" ? r.location : null,
    ...(fields.has("teamSlug") ? { teamSlug: typeof r.teamSlug === "string" ? r.teamSlug : null } : {}),
  }));

  return NextResponse.json({ items, total, page, pageSize } as ListOut, { status: 200 });
}
