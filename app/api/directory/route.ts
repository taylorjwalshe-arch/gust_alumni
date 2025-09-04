import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cap(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const pageSizeParam = parseInt(searchParams.get('pageSize') || '25', 10);
    const take = cap(Number.isFinite(pageSizeParam) ? pageSizeParam : 25, 1, 100);

    const where = q
      ? {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    let total = 0;
    try {
      total = await prisma.person.count({ where });
    } catch {
      total = 0;
    }

    const richSelect: any = {
      id: true,
      firstName: true,
      lastName: true,
      industries: true, // optional
      location: true,   // optional
    };

    let rows: any[] = [];
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

    const items = rows.map((p: any) => ({
      id: String(p.id),
      firstName: p.firstName ?? null,
      lastName: p.lastName ?? null,
      industries: Array.isArray(p.industries) ? (p.industries as string[]) : null,
      location: typeof p.location === 'string' ? (p.location as string) : null,
    }));

    return NextResponse.json({ items, total, page: 1, pageSize: take });
  } catch {
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 0 }, { status: 200 });
  }
}
