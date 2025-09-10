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
  findUnique: (args: unknown) => Promise<unknown | null>;
  findFirst: (args: unknown) => Promise<unknown | null>;
};

function hasDelegate(obj: unknown): obj is Delegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { findUnique?: unknown; findFirst?: unknown };
  return typeof o.findUnique === "function" && typeof o.findFirst === "function";
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
  return { id, title, company, location, isRequest, postedAt };
}

export async function GET(req: NextRequest, ctx: { params?: { id?: string } }) {
  const idParam = ctx?.params?.id ?? "";
  const safeEmpty = NextResponse.json({ item: null }, { status: 200 });

  try {
    const delegate = getDelegate();
    if (!delegate || !idParam) return safeEmpty;

    let row: unknown | null = null;

    try {
      row = await delegate.d.findUnique({
        where: { id: idParam as unknown as never },
        select: { id: true, title: true, company: true, location: true, isRequest: true, postedAt: true },
      });
    } catch {}

    if (!row) {
      const asNumber = Number(idParam);
      if (!Number.isNaN(asNumber)) {
        try {
          row = await delegate.d.findUnique({
            where: { id: asNumber as unknown as never },
            select: { id: true, title: true, company: true, location: true, isRequest: true, postedAt: true },
          });
        } catch {}
      }
    }

    if (!row) {
      try {
        row = await delegate.d.findFirst({
          where: { id: idParam as unknown as never },
          select: { id: true, title: true, company: true, location: true, isRequest: true, postedAt: true },
        });
      } catch {}
    }

    if (!row) return safeEmpty;

    const item = normalizeOne(row, idParam);
    return NextResponse.json({ item }, { status: 200 });
  } catch {
    return safeEmpty;
  }
}
