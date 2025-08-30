// app/api/directory/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

type ListDelegate = { findMany: (args: unknown) => Promise<unknown>; count: (args?: unknown) => Promise<number> };

function getModel(): ListDelegate {
  const name = process.env.PRISMA_DIRECTORY_MODEL || process.env.PRISMA_MENTOR_MODEL || 'person';
  const anyPrisma = prisma as unknown as Record<string, unknown>;
  const model = anyPrisma[name];
  if (!model) throw new Error(`PRISMA_DIRECTORY_MODEL='${name}' not found on prisma client.`);
  return model as unknown as ListDelegate;
}

export async function GET(request: Request) {
  try {
    const model = getModel();
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const pageSize = Math.min(Number(url.searchParams.get('pageSize') || '500'), 500);

    const itemsUnknown = await model.findMany({
      take: pageSize,
      select: { id: true, firstName: true, lastName: true },
    } as unknown);
    const total = await model.count();

    const list = (Array.isArray(itemsUnknown) ? itemsUnknown : []) as Array<Record<string, unknown>>;
    const normalized = list.map((r) => ({
      id: String(r.id),
      firstName: (r.firstName as string | undefined) ?? null,
      lastName: (r.lastName as string | undefined) ?? null,
    }));

    const filtered = q
      ? normalized.filter((x) => (`${x.firstName ?? ''} ${x.lastName ?? ''}`).toLowerCase().includes(q))
      : normalized;

    return NextResponse.json({ items: filtered, total, page: 1, pageSize });
  } catch (err) {
    console.error('Directory API error:', err);
    return NextResponse.json({ items: [], total: 0, page: 1, pageSize: 200, note: 'fallback-empty' });
  }
}
