import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cap(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type SafeItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  location: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const pageSizeParam = parseInt(searchParams.get('pageSize') || '25', 10);
    const take = cap(Number.isFinite(pageSizeParam) ? pageSizeParam : 25, 1, 100);

    const where = q
      ? {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' as const } },
            { lastName: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    let total = 0;
    try {
      total = await prisma.person.count({ where });
    } catch {
      total = 0;
    }

    const richSelect = {
      id: true,
      firstName: true,
      lastName: true,
      industries: true,
      location: true,
    } as const;

    let rows: unknown[] = [];
    try {
      rows = await prisma.person.findMany({
        where,
        take,
        orderBy: { id: 'asc' },
        select: richSelect,
      });
    } catch {
      rows = await prisma.person.findMany({
        where,
        take,
        orderBy: { id: 'asc' },
        select: { id: true, firstName: true, lastName: true },
      });
    }

    const items: SafeItem[] = (rows as Array<Record<string, unknown>>).map((p) => ({
      id: String(p.id as string | number),
      firstName: (p.firstName as string | null) ?? null,
      lastName: (p.lastName as string | null) ?? null,
      industries: Array.isArray((p as Record<string, unknown>).industries)
        ? ((p.industries as unknown[]) as string[])
        : null,
      location: typeof (p as Record<string, unknown>).location === 'string'
        ? (p.location as string)
        : null,
    }));

    return NextResponse.json({ items, total, page: 1, pageSize: take });
  } catch {
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 0 }, { status: 200 });
  }
}
