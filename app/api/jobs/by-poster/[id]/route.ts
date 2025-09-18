import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type NormalizedJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
  posterId: string | null;
};

const MODEL_ORDER = ["job", "jobs", "posting", "post", "opportunity"] as const;
const POSTER_KEYS = ["postedById", "personId", "posterId", "ownerId", "authorId", "createdById", "userId"] as const;

type ReadDelegate = {
  findMany: (args?: unknown) => Promise<unknown[]>;
  count: (args?: unknown) => Promise<number>;
};

function hasReadDelegate(obj: unknown): obj is ReadDelegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { findMany?: unknown; count?: unknown };
  return typeof o.findMany === "function" && typeof o.count === "function";
}

function getDelegate() {
  const bag = prisma as unknown as Record<string, unknown>;
  for (const name of MODEL_ORDER) {
    const cand = bag[name];
    if (hasReadDelegate(cand)) return { name, d: cand as ReadDelegate };
  }
  return null;
}

function normalize(items: unknown[]): NormalizedJob[] {
  const arr = Array.isArray(items) ? items : [];
  return arr.map((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const id = r.id != null ? String(r.id) : crypto.randomUUID();
    const title = typeof r.title === "string" ? r.title : null;
    const company = typeof r.company === "string" ? r.company : null;
    const location = typeof r.location === "string" ? r.location : null;
    const isRequest = typeof r.isRequest === "boolean" ? r.isRequest : null;
    let postedAt: string | null = null;
    if (r.postedAt instanceof Date) postedAt = r.postedAt.toISOString();
    else if (typeof r.postedAt === "string") {
      const d = new Date(r.postedAt);
      postedAt = isNaN(d.getTime()) ? null : d.toISOString();
    }
    let posterId: string | null = null;
    for (const k of POSTER_KEYS) {
      if (r[k] != null) { posterId = String(r[k]); break; }
    }
    return { id, title, company, location, isRequest, postedAt, posterId };
  });
}

export async function GET(_req: Request, context: unknown): Promise<Response> {
  const pid = (context as { params?: { id?: string } } | undefined)?.params?.id ?? "";
  const pageSize = 100;
  const page = 1;

  try {
    const delegate = getDelegate();
    if (!delegate || !pid) {
      return NextResponse.json({ items: [], total: 0, page, pageSize }, { status: 200 });
    }

    let items: unknown[] = [];
    let total = 0;

    const whereOr: unknown[] = [];
    for (const k of POSTER_KEYS) {
      whereOr.push({ [k]: pid });
      const asNum = Number(pid);
      if (!Number.isNaN(asNum)) whereOr.push({ [k]: asNum });
    }
    const where = whereOr.length ? { OR: whereOr } : {};

    try {
      const select: Record<string, true> = { id: true, title: true, company: true, location: true, isRequest: true, postedAt: true };
      for (const k of POSTER_KEYS) select[k] = true;
      items = await delegate.d.findMany({ where, take: pageSize, select, orderBy: { postedAt: "desc" } });
      total = await delegate.d.count({ where });
    } catch {
      try {
        items = await delegate.d.findMany({ where, take: pageSize, select: { id: true } });
        total = await delegate.d.count({ where });
      } catch {
        items = [];
        total = 0;
      }
    }

    const normalized = normalize(items);
    return NextResponse.json({ items: normalized, total, page, pageSize }, { status: 200 });
  } catch {
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 100 }, { status: 200 });
  }
}
