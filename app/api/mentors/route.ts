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
  // touch request so eslint doesn't whine
  void request.url;

  const model = getModel();

  const itemsUnknown = await model.findMany({
    take: 24,
    select: { id: true, firstName: true, lastName: true },
  } as unknown);

  const total = await model.count();

  const items = (Array.isArray(itemsUnknown) ? itemsUnknown : []) as Array<Record<string, unknown>>;
  const normalized = items.map((r) => ({
    id: String(r.id),
    firstName: (r.firstName as string | undefined) ?? null,
    lastName: (r.lastName as string | undefined) ?? null,
    headline: null,
    industry: null,
    location: null,
    imageUrl: null,
  }));

  return NextResponse.json({ items: normalized, total, page: 1, pageSize: 24 });
}
