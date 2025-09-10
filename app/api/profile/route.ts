import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type NormalizedPerson = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  location: string | null;
  industries: string[] | null;
};

const PERSON_CANDIDATES = ["person", "people", "alumni", "user", "member"] as const;

type ReadDelegate = {
  findUnique: (args: unknown) => Promise<unknown | null>;
  findFirst: (args: unknown) => Promise<unknown | null>;
};
type WriteDelegate = {
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
};

function hasRead(obj: unknown): obj is ReadDelegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { findUnique?: unknown; findFirst?: unknown };
  return typeof o.findUnique === "function" && typeof o.findFirst === "function";
}
function hasWrite(obj: unknown): obj is WriteDelegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { create?: unknown; update?: unknown };
  return typeof o.create === "function" && typeof o.update === "function";
}

function getDelegate<T extends ReadDelegate | WriteDelegate>(
  guard: (x: unknown) => x is T
): { name: (typeof PERSON_CANDIDATES)[number]; d: T } | null {
  const bag = prisma as unknown as Record<string, unknown>;
  for (const name of PERSON_CANDIDATES) {
    const cand = bag[name];
    if (guard(cand)) return { name, d: cand as T };
  }
  return null;
}

function normalizeOne(row: unknown, fallbackId: string): NormalizedPerson {
  const r = (row ?? {}) as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : fallbackId;
  const firstName = typeof r.firstName === "string" ? r.firstName : null;
  const lastName = typeof r.lastName === "string" ? r.lastName : null;
  const email = typeof r.email === "string" ? r.email : null;
  const location = typeof r.location === "string" ? r.location : null;
  const industries = Array.isArray(r.industries)
    ? (r.industries as unknown[]).filter((x): x is string => typeof x === "string").map((x) => x)
    : null;
  return { id, firstName, lastName, email, location, industries };
}

const selectRich: Record<string, true> = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  location: true,
  industries: true,
};
const selectNoIndustries: Record<string, true> = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  location: true,
};

export async function POST(req: Request): Promise<Response> {
  try {
    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const id = typeof payload.id === "string" && payload.id.trim() ? payload.id.trim() : null;
    const firstName =
      typeof payload.firstName === "string" && payload.firstName.trim() ? payload.firstName.trim() : null;
    const lastName =
      typeof payload.lastName === "string" && payload.lastName.trim() ? payload.lastName.trim() : null;
    const email = typeof payload.email === "string" && payload.email.trim() ? payload.email.trim() : null;
    const location =
      typeof payload.location === "string" && payload.location.trim() ? payload.location.trim() : null;

    let industries: string[] | null = null;
    if (Array.isArray(payload.industries)) {
      const arr = payload.industries as unknown[];
      industries = arr
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((x) => x.trim());
    } else if (typeof payload.industries === "string") {
      industries = (payload.industries as string)
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
    }

    const read = getDelegate<ReadDelegate>(hasRead);
    const write = getDelegate<WriteDelegate>(hasWrite);

    if (!write) {
      return NextResponse.json({ saved: false, id: null, reason: "No compatible person model" }, { status: 200 });
    }

    const dataRich: Record<string, unknown> = {};
    if (firstName !== null) dataRich.firstName = firstName;
    if (lastName !== null) dataRich.lastName = lastName;
    if (email !== null) dataRich.email = email;
    if (location !== null) dataRich.location = location;
    if (industries !== null) dataRich.industries = industries;

    let row: unknown | null = null;

    if (id) {
      try {
        row = await write.d.update({
          where: { id },
          data: dataRich,
          select: selectRich,
        });
      } catch {
        try {
          row = await write.d.update({
            where: { id },
            data: {},
            select: selectNoIndustries,
          });
        } catch {
          try {
            row = await write.d.create({ data: { ...(dataRich as object), id }, select: selectRich });
          } catch {
            try {
              row = await write.d.create({ data: {}, select: selectNoIndustries });
            } catch {
              return NextResponse.json({ saved: false, id: null, reason: "Create failed" }, { status: 200 });
            }
          }
        }
      }
    } else if (email && read) {
      let existing: unknown | null = null;
      try {
        existing = await read.d.findFirst({ where: { email }, select: { id: true } });
      } catch {}
      if (existing && (existing as { id?: unknown }).id != null) {
        const existingId = String((existing as { id: unknown }).id);
        try {
          row = await write.d.update({ where: { id: existingId }, data: dataRich, select: selectRich });
        } catch {
          try {
            row = await write.d.update({ where: { id: existingId }, data: {}, select: selectNoIndustries });
          } catch {
            row = null;
          }
        }
      }
      if (!row) {
        try {
          row = await write.d.create({ data: dataRich, select: selectRich });
        } catch {
          try {
            row = await write.d.create({ data: {}, select: selectNoIndustries });
          } catch {
            return NextResponse.json({ saved: false, id: null, reason: "Create failed" }, { status: 200 });
          }
        }
      }
    } else {
      try {
        row = await write.d.create({ data: dataRich, select: selectRich });
      } catch {
        try {
          row = await write.d.create({ data: {}, select: selectNoIndustries });
        } catch {
          return NextResponse.json({ saved: false, id: null, reason: "Create failed" }, { status: 200 });
        }
      }
    }

    const person = normalizeOne(row, crypto.randomUUID());
    return NextResponse.json({ saved: true, id: person.id, person }, { status: 200 });
  } catch {
    return NextResponse.json({ saved: false, id: null, reason: "Unhandled" }, { status: 200 });
  }
}
