// app/api/mentors/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

type ListDelegate = {
  findMany: (args: unknown) => Promise<unknown>;
  count: (args?: unknown) => Promise<number>;
};

function getModel(): ListDelegate {
  const name = process.env.PRISMA_MENTOR_MODEL || 'person';
  const anyPrisma = prisma as unknown as Record<string, unknown>;
  const model = anyPrisma[name];
  if (!model) throw new Error(`PRISMA_MENTOR_MODEL='${name}' not found on prisma client.`);
  return model as unknown as ListDelegate;
}

export async function GET(request: Request) {
  try {
    const model = getModel();
    const { searchParams } = new URL(request.url);
    const pageSize = Math.min(Number(searchParams.get('pageSize') || '200'), 500); // load more so client-side filters work

    // First, try to grab industries/expertise if they exist on your schema.
    try {
      const itemsUnknown = await model.findMany({
        take: pageSize,
        select: { id: true, firstName: true, lastName: true, industries: true, expertise: true },
      } as unknown);
      const total = await model.count();

      const items = (Array.isArray(itemsUnknown) ? itemsUnknown : []) as Array<Record<string, unknown>>;
      const normalized = items.map((r) => ({
        id: String(r.id),
        firstName: (r.firstName as string | undefined) ?? null,
        lastName: (r.lastName as string | undefined) ?? null,
        // optional arrays if present
        industries: (r.industries as string[] | undefined) ?? null,
        expertise: (r.expertise as string[] | undefined) ?? null,
        // keep these for UI shape
        headline: null,
        industry: null,
        location: null,
        imageUrl: null,
      }));
      return NextResponse.json({ items: normalized, total, page: 1, pageSize });
    } catch {
      // Fallback: minimal shape only (never throw)
      const itemsUnknown = await model.findMany({
        take: pageSize,
        select: { id: true, firstName: true, lastName: true },
      } as unknown);
      const total = await model.count();
      const items = (Array.isArray(itemsUnknown) ? itemsUnknown : []) as Array<Record<string, unknown>>;
      const normalized = items.map((r) => ({
        id: String(r.id),
        firstName: (r.firstName as string | undefined) ?? null,
        lastName: (r.lastName as string | undefined) ?? null,
        industries: null,
        expertise: null,
        headline: null,
        industry: null,
        location: null,
        imageUrl: null,
      }));
      return NextResponse.json({ items: normalized, total, page: 1, pageSize });
    }
  } catch (err) {
    console.error('Mentors API error:', err);
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 200, note: 'fallback-empty' });
  }
}
