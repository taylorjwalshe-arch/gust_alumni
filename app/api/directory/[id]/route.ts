// app/api/directory/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

type DetailDelegate = { findUnique: (args: unknown) => Promise<unknown> };

function getModel(): DetailDelegate {
  const name =
    process.env.PRISMA_DIRECTORY_MODEL ||
    process.env.PRISMA_MENTOR_MODEL ||
    'person';
  const anyPrisma = prisma as unknown as Record<string, unknown>;
  const model = anyPrisma[name];
  if (!model) throw new Error(`PRISMA_DIRECTORY_MODEL='${name}' not found on prisma client.`);
  return model as unknown as DetailDelegate;
}

function asRec(x: unknown): Record<string, unknown> {
  return (x ?? {}) as Record<string, unknown>;
}

export async function GET(request: Request) {
  try {
    const model = getModel();
    const { pathname } = new URL(request.url);
    const id = (pathname.split('/').pop() || '').trim();

    const fullSelect = {
      id: true,
      firstName: true,
      lastName: true,
      industries: true,
      expertise: true,
      location: true,
      imageUrl: true,
    } as const;

    const minSelect = { id: true, firstName: true, lastName: true } as const;
    const args = (val: string | number, select: object) =>
      ({ where: { id: val }, select }) as unknown;

    let data: unknown = null;
    try { data = await model.findUnique(args(id, fullSelect)); } catch {}
    if (!data && /^\d+$/.test(id)) { try { data = await model.findUnique(args(Number(id), fullSelect)); } catch {} }
    if (!data) {
      try { data = await model.findUnique(args(id, minSelect)); } catch {}
      if (!data && /^\d+$/.test(id)) { try { data = await model.findUnique(args(Number(id), minSelect)); } catch {} }
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const r = asRec(data);
    const firstName = typeof r.firstName === 'string' ? (r.firstName as string) : null;
    const lastName  = typeof r.lastName  === 'string' ? (r.lastName  as string) : null;
    const location  = typeof (r as { location?: unknown }).location === 'string' ? ((r as { location: string }).location) : null;
    const imageUrl  = typeof (r as { imageUrl?: unknown }).imageUrl === 'string' ? ((r as { imageUrl: string }).imageUrl) : null;
    const indRaw = (r as { industries?: unknown }).industries;
    const industries = Array.isArray(indRaw) ? (indRaw as unknown[]).map(String) : null;
    const expRaw = (r as { expertise?: unknown }).expertise;
    const expertise = Array.isArray(expRaw) ? (expRaw as unknown[]).map(String) : null;

    return NextResponse.json({
      id: String(r.id),
      firstName,
      lastName,
      industries,
      expertise,
      location,
      imageUrl,
    });
  } catch (err) {
    console.error('Directory detail API error:', err);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
