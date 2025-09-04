import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function devOnly() {
  return process.env.NODE_ENV === 'development';
}

type DemoRecord = Record<string, unknown>;
type Demo = DemoRecord[];

async function createManyLoose(data: Demo): Promise<boolean> {
  try {
    const delegate = prisma.person as unknown as {
      createMany: (args: unknown) => Promise<unknown>;
    };
    await delegate.createMany({
      data,
      // skipDuplicates may not exist in some client versions; we pass it loosely.
      skipDuplicates: true,
    } as unknown);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const total = await prisma.person.count();
    return NextResponse.json({ ok: true, total });
  } catch {
    return NextResponse.json({ ok: false, total: 0 });
  }
}

export async function POST(_req: NextRequest) {
  try {
    if (!devOnly()) {
      return NextResponse.json(
        { ok: false, error: 'Disabled outside development.' },
        { status: 403 }
      );
    }

    const existing = await prisma.person.count();
    if (existing > 0) {
      return NextResponse.json({
        ok: true,
        seeded: 0,
        message: 'Person already has rows; skipping.',
        total: existing,
      });
    }

    const demoFull: Demo = [
      { firstName: 'Ada', lastName: 'Lovelace', industries: ['Computing', 'Mathematics'], location: 'London', role: 'Member' },
      { firstName: 'Grace', lastName: 'Hopper', industries: ['Computing', 'Navy'], location: 'Arlington, VA', role: 'Member' },
      { firstName: 'Alan', lastName: 'Turing', industries: ['Research', 'Computing'], location: 'Wilmslow, UK', role: 'Member' },
    ];

    const demoNoRole: Demo = demoFull.map((d) => {
      const r = { ...d };
      delete (r as Record<string, unknown>).role;
      return r;
    });

    const demoRoleOnly: Demo = demoFull.map((d) => {
      const { firstName, lastName } = d as { firstName: string; lastName: string };
      const r: DemoRecord = { firstName, lastName };
      if (typeof d.role === 'string') (r as Record<string, unknown>).role = d.role;
      return r;
    });

    const demoMinimal: Demo = demoFull.map((d) => {
      const { firstName, lastName } = d as { firstName: string; lastName: string };
      return { firstName, lastName };
    });

    const variants: Demo[] = [demoFull, demoNoRole, demoRoleOnly, demoMinimal];

    let used = -1;
    for (let i = 0; i < variants.length; i++) {
      const ok = await createManyLoose(variants[i]);
      if (ok) {
        used = i;
        break;
      }
    }

    const total = await prisma.person.count();
    return NextResponse.json({
      ok: true,
      seeded: used >= 0 ? variants[used].length : 0,
      variantTried: used,
      total,
    });
  } catch {
    return NextResponse.json({ ok: false, seeded: 0, total: 0 }, { status: 200 });
  }
}
