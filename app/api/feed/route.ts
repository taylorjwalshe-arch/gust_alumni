import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type FeedItem = {
  type: "Job" | "Directory" | "Mentor";
  id: string;
  title: string | null;
  body?: string | null;
  postedAt: string;
};

function camelize(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}
function getModel(names: readonly string[]) {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const k of names) {
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
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") || "20")));
  const team = url.searchParams.get("team") || "";

  const items: FeedItem[] = [];

  const jobMeta = getModel(["job", "jobs", "posting", "post", "opportunity"]);
  if (jobMeta) {
    const d = getDelegate(jobMeta.name) as {
      findMany?: (args: unknown) => Promise<unknown[]>;
    };
    const fields = new Set(jobMeta.fields.map((f) => f.name));
    const where: Record<string, unknown> = {};
    if (team) {
      if (fields.has("teamSlug")) where["teamSlug"] = team;
      else if (fields.has("teamId")) where["teamId"] = team;
    }
    try {
      if (has(d, "findMany")) {
        let rows: unknown[] = [];
        try {
          rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
            where,
            take: pageSize,
            orderBy: fields.has("postedAt") ? { postedAt: "desc" } : undefined,
            select: Object.fromEntries(
              ["id", "title", "postedAt"].filter((k) => fields.has(k)).map((k) => [k, true] as const)
            ),
          });
        } catch {
          rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
            where,
            take: pageSize,
            select: Object.fromEntries(["id"].filter((k) => fields.has(k)).map((k) => [k, true] as const)),
          });
        }
        for (const r of rows as Record<string, unknown>[]) {
          items.push({
            type: "Job",
            id: normId(r.id),
            title: typeof r.title === "string" ? r.title : null,
            postedAt: iso(r.postedAt),
          });
        }
      }
    } catch {}
  }

  const personMeta = getModel(["person", "people", "alumni", "user", "member"]);
  if (personMeta) {
    const d = getDelegate(personMeta.name) as {
      findMany?: (args: unknown) => Promise<unknown[]>;
    };
    const fields = new Set(personMeta.fields.map((f) => f.name));
    const where: Record<string, unknown> = {};
    if (team) {
      if (fields.has("teamSlug")) where["teamSlug"] = team;
      else if (fields.has("teamId")) where["teamId"] = team;
    }
    try {
      if (has(d, "findMany")) {
        let rows: unknown[] = [];
        try {
          rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
            where,
            take: pageSize,
            select: Object.fromEntries(
              ["id", "firstName"].filter((k) => fields.has(k)).map((k) => [k, true] as const)
            ),
          });
        } catch {
          rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
            where,
            take: pageSize,
            select: Object.fromEntries(["id"].filter((k) => fields.has(k)).map((k) => [k, true] as const)),
          });
        }
        for (const r of rows as Record<string, unknown>[]) {
          items.push({
            type: "Directory",
            id: normId(r.id),
            title: typeof r.firstName === "string" ? r.firstName : null,
            postedAt: new Date().toISOString(),
          });
        }
      }
    } catch {}
  }

  items.sort((a, b) => (a.postedAt < b.postedAt ? 1 : a.postedAt > b.postedAt ? -1 : 0));

  return NextResponse.json(
    { items, total: items.length, page, pageSize },
    { status: 200 }
  );
}
