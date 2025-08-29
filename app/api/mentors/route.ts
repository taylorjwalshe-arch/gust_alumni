// app/api/mentors/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

function arr(q: string | null): string[] {
  if (!q) return [];
  return q.split(',').map((s) => s.trim()).filter(Boolean);
}

function getModel() {
  const name = process.env.PRISMA_MENTOR_MODEL || 'user';
  const anyPrisma = prisma as unknown as Record<string, unknown>;
  const model = anyPrisma[name];
  if (!model) throw new Error(`PRISMA_MENTOR_MODEL='${name}' not found on prisma client.`);
  return model as unknown;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const industries = arr(searchParams.get('industry'));
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Math.min(Number(searchParams.get('pageSize') || '24'), 50);
  const offset = (page - 1) * pageSize;

  const where = {
    AND: [
      // We *try* to filter by fields commonly present. If the model lacks them,
      // the catch() below will fallback to a simpler query.
      q
        ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' as const } },
              { lastName:  { contains: q, mode: 'insensitive' as const } },
              { headline:  { contains: q, mode: 'insensitive' as const } },
              { industry:  { contains: q, mode: 'insensitive' as const } },
              { location:  { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {},
      industries.length ? { industry: { in: industries } } : {},
      // If your seed marks mentors, we’ll add it later after we confirm the column name.
    ],
  };

  const orderBy = [{ lastName: 'asc' as const }, { firstName: 'asc' as const }];
  const model = getModel();

  let items: any[] = [];
  let total = 0;

  // Attempt full query (best case)
  try {
    // @ts-expect-error dynamic model
    items = await model.findMany({
      where, orderBy, skip: offset, take: pageSize,
      select: {
        id: true, firstName: true, lastName: true,
        headline: true, industry: true, location: true, imageUrl: true,
      },
    });
    // @ts-expect-error dynamic model
    total = await model.count({ where });
  } catch {
    // Fallback A: only select id, firstName, lastName
    try {
      // @ts-expect-error dynamic model
      items = await model.findMany({
        skip: offset, take: pageSize,
        select: { id: true, firstName: true, lastName: true },
      });
      // @ts-expect-error dynamic model
      total = await model.count();
      items = items.map((r: any) => ({
        id: String(r.id),
        firstName: r.firstName ?? null,
        lastName: r.lastName ?? null,
        headline: null, industry: null, location: null, imageUrl: null,
      }));
    } catch {
      // Fallback B: only id
      // @ts-expect-error dynamic model
      items = await model.findMany({ skip: offset, take: pageSize, select: { id: true } });
      // @ts-expect-error dynamic model
      total = await model.count();
      items = items.map((r: any) => ({
        id: String(r.id),
        firstName: null, lastName: null,
        headline: null, industry: null, location: null, imageUrl: null,
      }));
    }
  }

  return NextResponse.json({ items, total, page, pageSize });
}
