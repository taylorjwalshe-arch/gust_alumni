export const runtime = "nodejs";
import type { NextRequest } from "next/server";

type Person = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  location: string | null;
  industries: string[] | null;
  teamSlug?: string | null;
};

type Out = {
  ok: boolean;
  suggestion: (Person & { why?: string | null }) | null;
  reason?: string | null;
};

const RICH: Record<string, true> = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  location: true,
  industries: true,
  teamSlug: true,
};

const MINIMAL: Record<string, true> = { id: true };

function normPerson(p: Record<string, unknown>): Person {
  const industries = Array.isArray(p.industries)
    ? (p.industries as unknown[]).filter((x): x is string => typeof x === "string")
    : null;
  const id =
    typeof p.id === "string"
      ? p.id
      : typeof p.id === "number"
      ? String(p.id)
      : crypto.randomUUID();
  const ts: unknown = (p as Record<string, unknown>)["teamSlug"];
  return {
    id,
    firstName: typeof p.firstName === "string" ? p.firstName : null,
    lastName: typeof p.lastName === "string" ? p.lastName : null,
    email: typeof p.email === "string" ? p.email : null,
    location: typeof p.location === "string" ? p.location : null,
    industries,
    teamSlug: typeof ts === "string" ? ts : null,
  };
}

function ciIncludes(arr: string[] | null, needle: string): boolean {
  if (!arr || !needle) return false;
  const n = needle.toLowerCase();
  return arr.some((s) => s.toLowerCase().includes(n));
}

function isDelegate(x: unknown): x is { findMany: (args?: unknown) => Promise<unknown[]> } {
  return typeof x === "object" && x !== null && typeof (x as Record<string, unknown>).findMany === "function";
}

async function getDelegate() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prismaAny = new PrismaClient() as unknown as Record<string, unknown>;
    const candidates = ["mentor", "mentors", "candidate", "candidates", "person", "people", "alumni", "user", "member"];
    for (const name of candidates) {
      const key = (name[0]?.toLowerCase() || "") + name.slice(1);
      const d = prismaAny[key];
      if (isDelegate(d)) return d;
    }
  } catch {}
  return null;
}

function computeIndex(length: number, salt: string): number {
  if (length <= 0) return 0;
  let acc = 0;
  for (let i = 0; i < salt.length; i++) acc = (acc * 31 + salt.charCodeAt(i)) >>> 0;
  return acc % length;
}

export async function GET(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);
  const team = url.searchParams.get("team") || "";
  const industry = url.searchParams.get("industry") || "";
  const weekSalt = new Date().toISOString().slice(0, 10);

  try {
    const delegate = await getDelegate();
    if (!delegate) {
      const empty: Out = { ok: true, suggestion: null, reason: "No mentor/person model found" };
      return Response.json(empty, { status: 200 });
    }

    const where: Record<string, unknown> = {};
    if (team) where["teamSlug"] = team;

    let rows: unknown[] = [];
    try {
      rows = await delegate.findMany({
        where,
        take: 200,
        select: RICH,
        orderBy: { id: "asc" },
      });
    } catch {
      try {
        rows = await delegate.findMany({
          where,
          take: 200,
          select: RICH,
        });
      } catch {
        try {
          rows = await delegate.findMany({
            take: 200,
            select: MINIMAL,
          });
        } catch {
          rows = [];
        }
      }
    }

    const people = rows.map((r) => normPerson((r ?? {}) as Record<string, unknown>));
    const pool = industry ? people.filter((p) => ciIncludes(p.industries, industry)) : people;

    if (pool.length === 0) {
      const out: Out = { ok: true, suggestion: null, reason: "No candidates matched filters" };
      return Response.json(out, { status: 200 });
    }

    const idx = computeIndex(pool.length, `${team}|${industry}|${weekSalt}`);
    const pick = pool[idx];

    const why: string[] = [];
    if (team) why.push(`Same team: ${team}`);
    if (industry) why.push(`Industry match: ${industry}`);
    if (why.length === 0) why.push("Rotating weekly suggestion");
    const suggestion = { ...pick, why: why.join(" · ") };

    const out: Out = { ok: true, suggestion };
    return Response.json(out, { status: 200 });
  } catch {
    const out: Out = { ok: false, suggestion: null, reason: "Unhandled error; returning safe shape" };
    return Response.json(out, { status: 200 });
  }
}
