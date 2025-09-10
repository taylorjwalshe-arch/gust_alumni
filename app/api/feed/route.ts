import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type FeedItem = {
  id: string;
  type: "job";
  title: string | null;
  company: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
};

type FeedResponse = {
  items: FeedItem[];
  total: number;
  page: number;
  pageSize: number;
};

const JOB_CANDIDATES = ["job", "jobs", "posting", "post", "opportunity"] as const;

type ReadDelegate = {
  findMany: (args?: unknown) => Promise<unknown[]>;
  count: (args?: unknown) => Promise<number>;
};

function hasReadDelegate(obj: unknown): obj is ReadDelegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { findMany?: unknown; count?: unknown };
  return typeof o.findMany === "function" && typeof o.count === "function";
}

function getJobDelegate() {
  const bag = prisma as unknown as Record<string, unknown>;
  for (const name of JOB_CANDIDATES) {
    const cand = bag[name];
    if (hasReadDelegate(cand)) return cand as ReadDelegate;
  }
  return null;
}

function capPageSize(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 20;
  if (Number.isNaN(n) || n <= 0) return 20;
  return Math.min(n, 100);
}

function normalizeJobs(rows: unknown[]): FeedItem[] {
  const arr = Array.isArray(rows) ? rows : [];
  return arr.map((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const id = r.id != null ? String(r.id) : crypto.randomUUID();
    const title = typeof r.title === "string" ? r.title : null;
    const company = typeof r.company === "string" ? r.company : null;
    const isRequest = typeof r.isRequest === "boolean" ? r.isRequest : null;
    let postedAt: string | null = null;
    if (r.postedAt instanceof Date) postedAt = r.postedAt.toISOString();
    else if (typeof r.postedAt === "string") {
      const d = new Date(r.postedAt);
      postedAt = isNaN(d.getTime()) ? null : d.toISOString();
    }
    return { id, type: "job", title, company, isRequest, postedAt };
  });
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const pageSize = capPageSize(searchParams.get("pageSize"));
    const page = 1;

    const job = getJobDelegate();
    if (!job) {
      const empty: FeedResponse = { items: [], total: 0, page, pageSize };
      return NextResponse.json(empty, { status: 200 });
    }

    let items: unknown[] = [];
    let total = 0;

    try {
      items = await job.findMany({
        take: pageSize,
        orderBy: { postedAt: "desc" },
        select: { id: true, title: true, company: true, isRequest: true, postedAt: true },
      });
      total = await job.count();
    } catch {
      try {
        items = await job.findMany({
          take: pageSize,
          select: { id: true, title: true, company: true, isRequest: true, postedAt: true },
        });
        total = await job.count();
      } catch {
        try {
          items = await job.findMany({ take: pageSize, select: { id: true } });
          total = await job.count();
        } catch {
          items = [];
          total = 0;
        }
      }
    }

    const normalized = normalizeJobs(items);
    const body: FeedResponse = { items: normalized, total, page, pageSize };
    return NextResponse.json(body, { status: 200 });
  } catch {
    const body: FeedResponse = { items: [], total: 0, page: 1, pageSize: 20 };
    return NextResponse.json(body, { status: 200 });
  }
}
