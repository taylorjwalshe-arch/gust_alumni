import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type NormalizedJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
};

const MODEL_ORDER = ["job", "jobs", "posting", "post", "opportunity"] as const;

type Delegate = {
  findMany: (args?: unknown) => Promise<unknown[]>;
  count: (args?: unknown) => Promise<number>;
};

function hasDelegate(obj: unknown): obj is Delegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { findMany?: unknown; count?: unknown };
  return typeof o.findMany === "function" && typeof o.count === "function";
}

function getDelegate():
  | { name: (typeof MODEL_ORDER)[number]; d: Delegate }
  | null {
  const bag = prisma as unknown as Record<string, unknown>;
  for (const name of MODEL_ORDER) {
    const cand = bag[name];
    if (hasDelegate(cand)) return { name, d: cand };
  }
  return null;
}

function capPageSize(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 100;
  if (Number.isNaN(n) || n <= 0) return 100;
  return Math.min(n, 100);
}

function normalize(items: unknown[]): NormalizedJob[] {
  const rows = Array.isArray(items) ? items : [];
  return rows.map((raw) => {
    const row = (raw ?? {}) as Record<string, unknown>;
    const id =
      row.id !== undefined && row.id !== null ? String(row.id) : crypto.randomUUID();
    const title = typeof row.title === "string" ? row.title : null;
    const company = typeof row.company === "string" ? row.company : null;
    const location = typeof row.location === "string" ? row.location : null;
    const isRequest =
      typeof row.isRequest === "boolean" ? row.isRequest : null;
    let postedAt: string | null = null;
    if (row.postedAt instanceof Date) {
      postedAt = row.postedAt.toISOString();
    } else if (typeof row.postedAt === "string") {
      const d = new Date(row.postedAt);
      postedAt = isNaN(d.getTime()) ? null : d.toISOString();
    }
    return { id, title, company, location, isRequest, postedAt };
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const pageSize = capPageSize(searchParams.get("pageSize"));
    const page = 1;

    const delegate = getDelegate();
    if (!delegate) {
      return NextResponse.json(
        { items: [], total: 0, page, pageSize },
        { status: 200 }
      );
    }

    let items: unknown[] = [];
    let total = 0;
    let serverFiltered = false;

    const where: Record<string, unknown> = q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] }
      : {};

    try {
      items = await delegate.d.findMany({
        where,
        take: pageSize,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          isRequest: true,
          postedAt: true,
        },
        orderBy: { postedAt: "desc" },
      });
      total = await delegate.d.count({ where });
      serverFiltered = q.length > 0;
    } catch {
      try {
        items = await delegate.d.findMany({
          take: pageSize,
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            isRequest: true,
            postedAt: true,
          },
        });
        total = await delegate.d.count();
      } catch {
        try {
          items = await delegate.d.findMany({ take: pageSize, select: { id: true } });
          total = await delegate.d.count();
        } catch {
          items = [];
          total = 0;
        }
      }
    }

    let normalized = normalize(items);

    if (q && !serverFiltered) {
      const ql = q.toLowerCase();
      const filtered = normalized.filter((r) => {
        const t = r.title?.toLowerCase() ?? "";
        const c = r.company?.toLowerCase() ?? "";
        return t.includes(ql) || c.includes(ql);
      });
      total = filtered.length;
      normalized = filtered.slice(0, pageSize);
    }

    return NextResponse.json(
      { items: normalized, total, page, pageSize },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { items: [], total: 0, page: 1, pageSize: 100 },
      { status: 200 }
    );
  }
}
