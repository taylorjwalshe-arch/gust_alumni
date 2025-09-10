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

function capPageSize(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 100;
  if (Number.isNaN(n) || n <= 0) return 100;
  return Math.min(n, 100);
}

function getDelegate() {
  for (const name of MODEL_ORDER) {
    const d = (prisma as any)[name];
    if (d && typeof d.findMany === "function") return { name, d };
  }
  return null;
}

function normalize(items: any[]): NormalizedJob[] {
  return items.map((row) => {
    const id =
      row?.id != null ? String(row.id) : crypto.randomUUID();
    const title = row?.title != null ? String(row.title) : null;
    const company = row?.company != null ? String(row.company) : null;
    const location = row?.location != null ? String(row.location) : null;
    const isRequest =
      typeof row?.isRequest === "boolean" ? row.isRequest : null;
    const postedAt =
      row?.postedAt instanceof Date
        ? row.postedAt.toISOString()
        : typeof row?.postedAt === "string"
        ? new Date(row.postedAt).toString() !== "Invalid Date"
          ? new Date(row.postedAt).toISOString()
          : null
        : null;

    return { id, title, company, location, isRequest, postedAt };
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const pageSize = capPageSize(searchParams.get("pageSize"));
    const page = 1;

    const delegate = getDelegate();
    if (!delegate) {
      return NextResponse.json(
        { items: [], total: 0, page, pageSize },
        { status: 200 }
      );
    }

    let items: any[] = [];
    let total = 0;

    const where: any = {};
    if (q && q.trim()) {
      const OR: any[] = [];
      try { OR.push({ title: { contains: q, mode: "insensitive" } }); } catch {}
      try { OR.push({ company: { contains: q, mode: "insensitive" } }); } catch {}
      if (OR.length > 0) where.OR = OR;
    }

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
    } catch {
      try {
        items = await delegate.d.findMany({
          where,
          take: pageSize,
          select: { id: true },
          orderBy: undefined,
        });
        total = await delegate.d.count({ where });
      } catch {
        items = [];
        total = 0;
      }
    }

    const normalized = normalize(items);
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
