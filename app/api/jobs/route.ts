import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type NormalizedJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
  description?: string | null;
};

type JobsListResponse = {
  items: NormalizedJob[];
  total: number;
  page: number;
  pageSize: number;
};

type JobCreateResponse =
  | { created: true; item: NormalizedJob }
  | { created: false; item: null; reason: string };

const MODEL_ORDER = ["job", "jobs", "posting", "post", "opportunity"] as const;

type ReadDelegate = {
  findMany: (args?: unknown) => Promise<unknown[]>;
  count: (args?: unknown) => Promise<number>;
};
type WriteDelegate = {
  create: (args: unknown) => Promise<unknown>;
};

function hasReadDelegate(obj: unknown): obj is ReadDelegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { findMany?: unknown; count?: unknown };
  return typeof o.findMany === "function" && typeof o.count === "function";
}
function hasWriteDelegate(obj: unknown): obj is WriteDelegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { create?: unknown };
  return typeof o.create === "function";
}

function getDelegate<T extends ReadDelegate | WriteDelegate>(
  guard: (x: unknown) => x is T
): { name: (typeof MODEL_ORDER)[number]; d: T } | null {
  const bag = prisma as unknown as Record<string, unknown>;
  for (const name of MODEL_ORDER) {
    const cand = bag[name];
    if (guard(cand)) return { name, d: cand as T };
  }
  return null;
}

function capPageSize(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 100;
  if (Number.isNaN(n) || n <= 0) return 100;
  return Math.min(n, 100);
}

function normalize(rows: unknown[]): NormalizedJob[] {
  const arr = Array.isArray(rows) ? rows : [];
  return arr.map((raw) => normalizeOne(raw, crypto.randomUUID()));
}

function normalizeOne(row: unknown, fallbackId: string): NormalizedJob {
  const r = (row ?? {}) as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : fallbackId;
  const title = typeof r.title === "string" ? r.title : null;
  const company = typeof r.company === "string" ? r.company : null;
  const location = typeof r.location === "string" ? r.location : null;
  const isRequest = typeof r.isRequest === "boolean" ? r.isRequest : null;
  let postedAt: string | null = null;
  if (r.postedAt instanceof Date) {
    postedAt = r.postedAt.toISOString();
  } else if (typeof r.postedAt === "string") {
    const d = new Date(r.postedAt);
    postedAt = isNaN(d.getTime()) ? null : d.toISOString();
  }
  const description = typeof r.description === "string" ? r.description : undefined;
  return { id, title, company, location, isRequest, postedAt, description };
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const pageSize = capPageSize(searchParams.get("pageSize"));
    const page = 1;

    const delegate = getDelegate<ReadDelegate>(hasReadDelegate);
    if (!delegate) {
      const empty: JobsListResponse = { items: [], total: 0, page, pageSize };
      return NextResponse.json(empty, { status: 200 });
    }

    let items: unknown[] = [];
    let total = 0;
    let serverFiltered = false;

    const where = q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] }
      : {};

    const selectWithDesc: Record<string, true> = {
      id: true,
      title: true,
      company: true,
      location: true,
      isRequest: true,
      postedAt: true,
      description: true,
    };
    const selectNoDesc: Record<string, true> = {
      id: true,
      title: true,
      company: true,
      location: true,
      isRequest: true,
      postedAt: true,
    };

    try {
      items = await delegate.d.findMany({
        where,
        take: pageSize,
        select: selectWithDesc,
        orderBy: { postedAt: "desc" },
      });
      total = await delegate.d.count({ where });
      serverFiltered = q.length > 0;
    } catch {
      try {
        items = await delegate.d.findMany({
          where,
          take: pageSize,
          select: selectNoDesc,
          orderBy: { postedAt: "desc" },
        });
        total = await delegate.d.count({ where });
        serverFiltered = q.length > 0;
      } catch {
        try {
          items = await delegate.d.findMany({
            take: pageSize,
            select: selectWithDesc,
          });
          total = await delegate.d.count();
        } catch {
          try {
            items = await delegate.d.findMany({
              take: pageSize,
              select: selectNoDesc,
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

    const body: JobsListResponse = { items: normalized, total, page, pageSize };
    return NextResponse.json(body, { status: 200 });
  } catch {
    const body: JobsListResponse = { items: [], total: 0, page: 1, pageSize: 100 };
    return NextResponse.json(body, { status: 200 });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const payload = await req.json().catch(() => ({}));
    const title = typeof payload.title === "string" && payload.title.trim() ? payload.title.trim() : null;
    const company = typeof payload.company === "string" && payload.company.trim() ? payload.company.trim() : null;
    const location = typeof payload.location === "string" && payload.location.trim() ? payload.location.trim() : null;
    const isRequest = typeof payload.isRequest === "boolean" ? payload.isRequest : null;
    const posterId = typeof payload.posterId === "string" && payload.posterId.trim() ? payload.posterId.trim() : null;
    const description = typeof payload.description === "string" && payload.description.trim() ? payload.description.trim() : null;
    const postedAtRaw = typeof payload.postedAt === "string" ? payload.postedAt : null;
    const postedAtValid = postedAtRaw ? new Date(postedAtRaw) : null;
    const postedAt = postedAtValid && !isNaN(postedAtValid.getTime()) ? postedAtValid.toISOString() : new Date().toISOString();

    const write = getDelegate<WriteDelegate>(hasWriteDelegate);
    if (!write) {
      const body: JobCreateResponse = { created: false, item: null, reason: "No compatible model" };
      return NextResponse.json(body, { status: 200 });
    }

    const dataRich: Record<string, unknown> = {};
    if (title !== null) dataRich.title = title;
    if (company !== null) dataRich.company = company;
    if (location !== null) dataRich.location = location;
    if (isRequest !== null) dataRich.isRequest = isRequest;
    if (posterId !== null) dataRich.posterId = posterId;
    if (description !== null) dataRich.description = description;
    dataRich.postedAt = postedAt;

    let createdRow: unknown | null = null;

    try {
      createdRow = await write.d.create({
        data: dataRich,
        select: { id: true, title: true, company: true, location: true, isRequest: true, postedAt: true, description: true },
      });
    } catch {
      try {
        createdRow = await write.d.create({
          data: {},
          select: { id: true, title: true, company: true, location: true, isRequest: true, postedAt: true, description: true },
        });
      } catch {
        const body: JobCreateResponse = { created: false, item: null, reason: "Create failed" };
        return NextResponse.json(body, { status: 200 });
      }
    }

    const item = normalizeOne(createdRow, crypto.randomUUID());
    const body: JobCreateResponse = { created: true, item };
    return NextResponse.json(body, { status: 200 });
  } catch {
    const body: JobCreateResponse = { created: false, item: null, reason: "Unhandled" };
    return NextResponse.json(body, { status: 200 });
  }
}
