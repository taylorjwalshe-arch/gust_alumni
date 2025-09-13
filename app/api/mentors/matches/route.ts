export const runtime = "nodejs";

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
  items: (Person & { why?: string | null })[];
  total: number;
  page: number;
  pageSize: number;
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

function isDelegate(x: unknown): x is {
  findMany: (args?: unknown) => Promise<unknown[]>;
  count?: (args?: unknown) => Promise<number>;
} {
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

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const team = url.searchParams.get("team") || "";
  const industry = url.searchParams.get("industry") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") || "10", 10) || 10));

  try {
    const delegate = await getDelegate();
    if (!delegate) {
      const empty: Out = { ok: true, items: [], total: 0, page, pageSize, reason: "No mentor/person model found" };
      return Response.json(empty, { status: 200 });
    }

    const where: Record<string, unknown> = {};
    if (team) where["teamSlug"] = team;

    let rows: unknown[] = [];
    try {
      rows = await delegate.findMany({
        where,
        take: pageSize * 5,
        select: RICH,
        orderBy: { id: "asc" },
      });
    } catch {
      try {
        rows = await delegate.findMany({
          where,
          take: pageSize * 5,
          select: RICH,
        });
      } catch {
        try {
          rows = await delegate.findMany({
            take: pageSize * 5,
            select: MINIMAL,
          });
        } catch {
          rows = [];
        }
      }
    }

    const all = (rows as unknown[]).map((r) => normPerson((r ?? {}) as Record<string, unknown>));
    const filtered = industry ? all.filter((p) => ciIncludes(p.industries, industry)) : all;

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize).map((p) => {
      const why: string[] = [];
      if (team) why.push(`Same team: ${team}`);
      if (industry) why.push(`Industry match: ${industry}`);
      if (why.length === 0) why.push("General pool");
      return { ...p, why: why.join(" · ") };
    });

    const out: Out = { ok: true, items, total: filtered.length, page, pageSize };
    return Response.json(out, { status: 200 });
  } catch {
    const out: Out = { ok: false, items: [], total: 0, page, pageSize, reason: "Unhandled error; returning safe shape" };
    return Response.json(out, { status: 200 });
  }
}
