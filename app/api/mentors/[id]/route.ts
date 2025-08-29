// app/api/mentors/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

type DetailDelegate = { findUnique: (args: unknown) => Promise<unknown> };

function getModel(): DetailDelegate {
  const name = process.env.PRISMA_MENTOR_MODEL || 'person';
  const anyPrisma = prisma as unknown as Record<string, unknown>;
  const model = anyPrisma[name];
  if (!model) throw new Error(`PRISMA_MENTOR_MODEL='${name}' not found on prisma client.`);
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

    const args = (val: string | number) =>
      ({ where: { id: val }, select: { id: true, firstName: true, lastName: true } }) as unknown;

    let data = await model.findUnique(args(id));
    if (!data && /^\d+$/.test(id)) data = await model.findUnique(args(Number(id)));
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const r = asRec(data);
    return NextResponse.json({
      id: String(r.id),
      firstName: (r.firstName as string | undefined) ?? null,
      lastName: (r.lastName as string | undefined) ?? null,
      headline: null,
      industry: null,
      location: null,
      imageUrl: null,
    });
  } catch (err) {
    console.error('Mentor detail API error:', err);
    // Return JSON 404 rather than throwing
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
