// app/api/mentors/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

function arr(q: string | null): string[] {
  if (!q) return [];
  return q.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const industries = arr(searchParams.get('industry'));
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Math.min(Number(searchParams.get('pageSize') || '24'), 50);

  const where = {
    AND: [
      { isMentor: true },
      q
        ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' as const } },
              { lastName: { contains: q, mode: 'insensitive' as const } },
              { headline: { contains: q, mode: 'insensitive' as const } },
              { industry: { contains: q, mode: 'insensitive' as const } },
              { location: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {},
      industries.length ? { industry: { in: industries } } : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        headline: true,
        industry: true,
        location: true,
        imageUrl: true,
      },
    }),
    prisma.profile.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
