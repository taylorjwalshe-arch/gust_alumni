// app/api/mentors/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

function arr(q: string | null): string[] {
  if (!q) return [];
  return q.split(',').map((s) => s.trim()).filter(Boolean);
}

// Try common model names: adjust or extend this list if needed later.
const MODEL_CANDIDATES = ['profile', 'profiles', 'alumniProfile', 'user', 'users'] as const;

function getPrismaModel(): unknown {
  const client = prisma as unknown as Record<string, unknown>;
  for (const name of MODEL_CANDIDATES) {
    const m = client[name];
    if (m && typeof m === 'object') return m;
  }
  throw new Error(
    'Mentors API: No suitable Prisma model found. Tried: ' + MODEL_CANDIDATES.join(', ')
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const industries = arr(searchParams.get('industry'));
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Math.min(Number(searchParams.get('pageSize') || '24'), 50);

  const where = {
    AND: [
      // Assumes your model has an isMentor boolean flag set in seed.
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

  const orderBy = [{ lastName: 'asc' as const }, { firstName: 'asc' as const }];

  const model = getPrismaModel();

  // We intentionally use @ts-expect-error on the dynamic calls below.
  // Reason: the exact Prisma model name varies across repos; we pick it at runtime.
  // TypeScript cannot know which model we chosen, but at runtime Prisma handles it.
  // @ts-expect-error – dynamic Prisma model
  const items = await model.findMany({
    where,
    orderBy,
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
  });

  // @ts-expect-error – dynamic Prisma model
  const total = await model.count({ where });

  return NextResponse.json({ items, total, page, pageSize });
}
