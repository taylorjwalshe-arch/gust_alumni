import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type FeedJob = {
  id: string;
  type: "job";
  title: string | null;
  company: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
};

type FeedPerson = {
  id: string;
  type: "person";
  name: string | null;
  postedAt: string | null;
};

type FeedMentor = {
  id: string;
  type: "mentor";
  name: string | null;
  postedAt: string | null;
};

type FeedItem = FeedJob | FeedPerson | FeedMentor;

type FeedResponse = {
  items: FeedItem[];
  total: number;
  page: number;
  pageSize: number;
};

const JOB_CANDIDATES = ["job", "jobs", "posting", "post", "opportunity"] as const;
const PERSON_CANDIDATES = ["person", "people", "alumni", "user", "member"] as const;
const MENTOR_CANDIDATES = ["mentor", "mentors", "candidate", "candidates"] as const;

type ReadDelegate = {
  findMany: (args?: unknown) => Promise<unknown[]>;
  count: (args?: unknown) => Promise<number>;
};

function hasReadDelegate(obj: unknown): obj is ReadDelegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { findMany?: unknown; count?: unknown };
  return typeof o.findMany === "function" && typeof o.count === "function";
}

function getFirstDelegate(names: readonly string[]) {
  const bag = prisma as unknown as Record<string, unknown>;
  for (const name of names) {
    const cand = bag[name];
    if (hasReadDelegate(cand)) return cand as ReadDelegate;
  }
  return null;
}

function isoFromDateish(v: unknown): string | null {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

function normalizeJobs(rows: unknown[]): FeedJob[] {
  const arr = Array.isArray(rows) ? rows : [];
  return arr.map((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const id = r.id != null ? String(r.id) : crypto.randomUUID();
    const title = typeof r.title === "string" ? r.title : null;
    const company = typeof r.company === "string" ? r.company : null;
    const isRequest = typeof r.isRequest === "boolean" ? r.isRequest : null;
    const postedAt = isoFromDateish(r.postedAt);
    return { id, type: "job", title, company, isRequest, postedAt };
  });
}

function normalizePeople(rows: unknown[]): FeedPerson[] {
  const arr = Array.isArray(rows) ? rows : [];
  return arr.map((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const id = r.id != null ? String(r.id) : crypto.randomUUID();
    const first = typeof r.firstName === "string" ? r.firstName : null;
    const last = typeof r.lastName === "string" ? r.lastName : null;
    const name =
      first || last ? `${(first ?? "").trim()} ${(last ?? "").trim()}`.trim() : null;
    const postedAt =
      isoFromDateish(r.updatedAt) ?? isoFromDateish(r.createdAt);
    return { id, type: "person", name, postedAt };
  });
}

function normalizeMentors(rows: unknown[]): FeedMentor[] {
  const arr = Array.isArray(rows) ? rows : [];
  return arr.map((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const id = r.id != null ? String(r.id) : crypto.randomUUID();
    const first = typeof r.firstName === "string" ? r.firstName : null;
    const last = typeof r.lastName === "string" ? r.lastName : null;
    const name =
      first || last ? `${(first ?? "").trim()} ${(last ?? "").trim()}`.trim() : null;
    const postedAt =
      isoFromDateish(r.updatedAt) ?? isoFromDateish(r.createdAt);
    return { id, type: "mentor", name, postedAt };
  });
}

function capPageSize(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 20;
  if (Number.isNaN(n) || n <= 0) return 20;
  return Math.min(n, 100);
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const pageSize = capPageSize(searchParams.get("pageSize"));
    const page = 1;

    const job = getFirstDelegate(JOB_CANDIDATES);
    const person = getFirstDelegate(PERSON_CANDIDATES);
    const mentor = getFirstDelegate(MENTOR_CANDIDATES);

    const items: FeedItem[] = [];
    let total = 0;

    if (job) {
      try {
        const rows = await job.findMany({
          take: pageSize,
          orderBy: { postedAt: "desc" },
          select: { id: true, title: true, company: true, isRequest: true, postedAt: true },
        });
        const n = normalizeJobs(rows);
        items.push(...n);
        total += n.length;
      } catch {
        try {
          const rows = await job.findMany({
            take: pageSize,
            select: { id: true, title: true, company: true, isRequest: true, postedAt: true },
          });
          const n = normalizeJobs(rows);
          items.push(...n);
          total += n.length;
        } catch {}
      }
    }

    if (person) {
      try {
        const rows = await person.findMany({
          take: pageSize,
          orderBy: { updatedAt: "desc" } as unknown,
          select: { id: true, firstName: true, lastName: true, updatedAt: true, createdAt: true },
        });
        const n = normalizePeople(rows);
        items.push(...n);
        total += n.length;
      } catch {
        try {
          const rows = await person.findMany({
            take: pageSize,
            select: { id: true, firstName: true, lastName: true, updatedAt: true, createdAt: true },
          });
          const n = normalizePeople(rows);
          items.push(...n);
          total += n.length;
        } catch {
          try {
            const rows = await person.findMany({ take: pageSize, select: { id: true } });
            const n = normalizePeople(rows);
            items.push(...n);
            total += n.length;
          } catch {}
        }
      }
    }

    if (mentor) {
      try {
        const rows = await mentor.findMany({
          take: pageSize,
          orderBy: { updatedAt: "desc" } as unknown,
          select: { id: true, firstName: true, lastName: true, updatedAt: true, createdAt: true },
        });
        const n = normalizeMentors(rows);
        items.push(...n);
        total += n.length;
      } catch {
        try {
          const rows = await mentor.findMany({
            take: pageSize,
            select: { id: true, firstName: true, lastName: true, updatedAt: true, createdAt: true },
          });
          const n = normalizeMentors(rows);
          items.push(...n);
          total += n.length;
        } catch {
          try {
            const rows = await mentor.findMany({ take: pageSize, select: { id: true } });
            const n = normalizeMentors(rows);
            items.push(...n);
            total += n.length;
          } catch {}
        }
      }
    }

    items.sort((a, b) => {
      const ad = a.postedAt ? new Date(a.postedAt).getTime() : 0;
      const bd = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      return bd - ad;
    });

    const sliced = items.slice(0, pageSize);
    const body: FeedResponse = { items: sliced, total, page, pageSize };
    return NextResponse.json(body, { status: 200 });
  } catch {
    const body: FeedResponse = { items: [], total: 0, page: 1, pageSize: 20 };
    return NextResponse.json(body, { status: 200 });
  }
}
