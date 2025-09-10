import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
