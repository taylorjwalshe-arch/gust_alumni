import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type NormalizedJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
  description: string | null;
  posterId: string | null;
};

const MODEL_ORDER = ["job", "jobs", "posting", "post", "opportunity"] as const;
const POSTER_KEYS = ["postedById", "personId", "posterId", "ownerId", "authorId", "createdById", "userId"] as const;

type Delegate = {
  findUnique: (args: unknown) => Promise<unknown | null>;
  findFirst: (args: unknown) => Promise<unknown | null>;
};

function hasDelegate(obj: unknown): obj is Delegate {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as { findUnique?: unknown; findFirst?: unknown };
  return typeof o.findUnique === "function" && typeof o.findFirst === "function";
}

function getDelegate() {
  const bag = prisma as unknown as Record<string, unknown>;
  for (const name of MODEL_ORDER) {
    const cand = bag[name];
    if (hasDelegate(cand)) return { name, d: cand as Delegate };
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
  if (r.postedAt instanceof Date) postedAt = r.postedAt.toISOString();
  else if (typeof r.postedAt === "string") {
    const d = new Date(r.postedAt);
    postedAt = isNaN(d.getTime()) ? null : d.toISOString();
  }
  const description = typeof r.description === "string" ? r.description : null;
  let posterId: string | null = null;
  for (const k of POSTER_KEYS) {
    if (r[k] != null) { posterId = String(r[k]); break; }
  }
  return { id, title, company, location, isRequest, postedAt, description, posterId };
}

const selectRich = () => {
  const base: Record<string, true> = { id: true, title: true, company: true, location: true, isRequest: true, postedAt: true, description: true };
  for (const k of POSTER_KEYS) base[k] = true;
  return base;
};

const selectNoDesc = () => {
  const base: Record<string, true> = { id: true, title: true, company: true, location: true, isRequest: true, postedAt: true };
  for (const k of POSTER_KEYS) base[k] = true;
  return base;
};

async function tryUnique(d: Delegate, where: unknown): Promise<unknown | null> {
  try { return await d.findUnique({ where, select: selectRich() }); } catch {}
  try { return await d.findUnique({ where, select: selectNoDesc() }); } catch {}
  return null;
}

async function tryFirst(d: Delegate, where: unknown): Promise<unknown | null> {
  try { return await d.findFirst({ where, select: selectRich() }); } catch {}
  try { return await d.findFirst({ where, select: selectNoDesc() }); } catch {}
  return null;
}

export async function GET(_req: Request, context: unknown): Promise<Response> {
  const params = (context as { params?: { id?: string } } | undefined)?.params;
  const idParam = params?.id ?? "";
  const safeEmpty = NextResponse.json({ item: null }, { status: 200 });

  try {
    const delegate = getDelegate();
    if (!delegate || !idParam) return safeEmpty;

    const d = delegate.d;
    let row: unknown | null = null;

    row = await tryUnique(d, { id: idParam });
    if (!row) {
      const asNumber = Number(idParam);
      if (!Number.isNaN(asNumber)) row = await tryUnique(d, { id: asNumber });
    }
    if (!row) row = await tryFirst(d, { id: idParam });
    if (!row) return safeEmpty;

    const item = normalizeOne(row, idParam);
    return NextResponse.json({ item }, { status: 200 });
  } catch {
    return safeEmpty;
  }
}
