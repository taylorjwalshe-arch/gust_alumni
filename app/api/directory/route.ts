import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type Item = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  location: string | null;
};
type ListOut = { items: Item[]; total: number; page: number; pageSize: number };

const PERSON_CANDIDATES = ["person", "people", "alumni", "user", "member"] as const;

function camelize(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}
function getModel() {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const k of PERSON_CANDIDATES) {
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

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const team = url.searchParams.get("team") || "";
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") || "50")));

  const meta = getModel();
  if (!meta) return NextResponse.json({ items: [], total: 0, page, pageSize } as ListOut, { status: 200 });

  const d = getDelegate(meta.name) as {
    findMany?: (args: unknown) => Promise<unknown[]>;
    count?: (args: unknown) => Promise<number>;
  };

  const fields = new Set(meta.fields.map((f) => f.name));
  const where: Record<string, unknown> = {};
  if (q && fields.has("firstName")) where["firstName"] = { contains: q, mode: "insensitive" };
  if (q && fields.has("lastName")) where["lastName"] = { contains: q, mode: "insensitive" };
  if (team) {
    if (fields.has("teamSlug")) where["teamSlug"] = team;
    else if (fields.has("teamId")) where["teamId"] = team;
  }

  const select: Record<string, true> = {};
  ["id", "firstName", "lastName", "industries", "location"].forEach((k) => {
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
          select,
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

  const items = (rows as Record<string, unknown>[]).map((r) => {
    const industries = Array.isArray(r.industries)
      ? (r.industries as unknown[]).filter((x): x is string => typeof x === "string")
      : null;
    return {
      id: normId(r.id),
      firstName: typeof r.firstName === "string" ? r.firstName : null,
      lastName: typeof r.lastName === "string" ? r.lastName : null,
      industries,
      location: typeof r.location === "string" ? r.location : null,
    };
  });

  return NextResponse.json({ items, total, page, pageSize } as ListOut, { status: 200 });
}
