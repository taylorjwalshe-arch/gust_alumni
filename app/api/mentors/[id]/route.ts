// app/api/mentors/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

function getModel() {
  const name = process.env.PRISMA_MENTOR_MODEL || 'user';
  const anyPrisma = prisma as unknown as Record<string, unknown>;
  const model = anyPrisma[name];
  if (!model) throw new Error(`PRISMA_MENTOR_MODEL='${name}' not found on prisma client.`);
  return model as unknown;
}

export async function GET(req: Request) {
  const model = getModel();
  const { pathname } = new URL(req.url);
  const id = pathname.split('/').pop() as string;

  let data: any = null;

  // Try with richer selection
  try {
    // @ts-expect-error dynamic model
    data = await model.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true,
        headline: true, industry: true, location: true, imageUrl: true,
      },
    });
  } catch {
    // If string id doesn’t exist, try numeric id
    if (/^\d+$/.test(id)) {
      try {
        // @ts-expect-error dynamic model
        data = await model.findUnique({
          where: { id: Number(id) },
          select: {
            id: true, firstName: true, lastName: true,
            headline: true, industry: true, location: true, imageUrl: true,
          },
        });
      } catch { /* ignore */ }
    }
  }

  // Fallback: minimal selection
  if (!data) {
    try {
      // @ts-expect-error dynamic model
      data = await model.findUnique({ where: { id }, select: { id: true, firstName: true, lastName: true } });
    } catch {
      if (/^\d+$/.test(id)) {
        // @ts-expect-error dynamic model
        data = await model.findUnique({ where: { id: Number(id) }, select: { id: true } });
      }
    }
  }

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: String(data.id),
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    headline: data.headline ?? null,
    industry: data.industry ?? null,
    location: data.location ?? null,
    imageUrl: data.imageUrl ?? null,
  });
}
