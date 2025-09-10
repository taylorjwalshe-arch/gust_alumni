import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Candidate = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  location: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type SuggestResponse = {
  item: Candidate | null;
  weekStartISO: string;
};

const MENTOR_CANDS = ["mentor", "mentors", "candidate", "candidates"] as const;
const PERSON_CANDS = ["person", "people", "alumni", "user", "member"] as const;

type ReadDelegate = {
  findMany: (args?: unknown) => Promise<unknown[]>;
  count: (args?: unknown) => Promise<number>;
};

function hasRead(d: unknown): d is ReadDelegate {
  if (!d || typeof d !== "object") return false;
  const o = d as { findMany?: unknown; count?: unknown };
  return typeof o.findMany === "function" && typeof o.count === "function";
}

function getFirst(names: readonly string[]) {
  const bag = prisma as unknown as Record<string, unknown>;
  for (const n of names) {
    const d = bag[n];
    if (hasRead(d)) return d as ReadDelegate;
  }
  return null;
}

function isoFrom(v: unknown): string | null {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

function normRows(rows: unknown[]): Candidate[] {
  const arr = Array.isArray(rows) ? rows : [];
  return arr.map((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const id = r.id != null ? String(r.id) : crypto.randomUUID();
    const firstName = typeof r.firstName === "string" ? r.firstName : null;
    const lastName = typeof r.lastName === "string" ? r.lastName : null;
    const industries = Array.isArray(r.industries)
      ? (r.industries as unknown[]).filter((x): x is string => typeof x === "string")
      : null;
    const location = typeof r.location === "string" ? r.location : null;
    const updatedAt = isoFrom(r.updatedAt);
    const createdAt = isoFrom(r.createdAt);
    return { id, firstName, lastName, industries, location, updatedAt, createdAt };
  });
}

function weekStartISO(now = new Date()): string {
  const d = new Date(now);
  const day = d.getUTCDay(); // 0-6, Sun=0
  const diff = (day + 6) % 7; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function stableIndex(seed: string, n: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  if (h < 0) h = -h;
  return n > 0 ? h % n : 0;
}

export async function GET(): Promise<Response> {
  const weekISO = weekStartISO();

  try {
    const mentor = getFirst(MENTOR_CANDS) ?? getFirst(PERSON_CANDS);
    if (!mentor) {
      const body: SuggestResponse = { item: null, weekStartISO: weekISO };
      return NextResponse.json(body, { status: 200 });
    }

    let items: unknown[] = [];
    try {
      items = await mentor.findMany({
        take: 200,
        orderBy: { updatedAt: "desc" } as unknown,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          industries: true,
          location: true,
          updatedAt: true,
          createdAt: true,
        },
      });
    } catch {
      try {
        items = await mentor.findMany({
          take: 200,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            industries: true,
            location: true,
            updatedAt: true,
            createdAt: true,
          },
        });
      } catch {
        try {
          items = await mentor.findMany({ take: 200, select: { id: true } });
        } catch {
          items = [];
        }
      }
    }

    const normalized = normRows(items).filter((x) => x.id);
    if (normalized.length === 0) {
      const body: SuggestResponse = { item: null, weekStartISO: weekISO };
      return NextResponse.json(body, { status: 200 });
    }

    normalized.sort((a, b) => {
      const ad = isoFrom(a.updatedAt) ?? isoFrom(a.createdAt) ?? null;
      const bd = isoFrom(b.updatedAt) ?? isoFrom(b.createdAt) ?? null;
      const at = ad ? new Date(ad).getTime() : 0;
      const bt = bd ? new Date(bd).getTime() : 0;
      return bt - at;
    });

    const idx = stableIndex(weekISO, normalized.length);
    const pick = normalized[idx];

    const body: SuggestResponse = { item: pick, weekStartISO: weekISO };
    return NextResponse.json(body, { status: 200 });
  } catch {
    const body: SuggestResponse = { item: null, weekStartISO: weekISO };
    return NextResponse.json(body, { status: 200 });
  }
}
