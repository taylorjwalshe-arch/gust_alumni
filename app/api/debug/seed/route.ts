import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function devOnly() {
  return process.env.NODE_ENV === 'development';
}

type Demo = Array<Record<string, unknown>>;

async function tryCreate(data: Demo): Promise<boolean> {
  try {
    await prisma.person.createMany({
      data,
      // @ts-expect-error: skipDuplicates may not be in very old client types; safe for current prisma
      skipDuplicates: true,
    } as any);
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

export async function POST(req: NextRequest) {
  try {
    if (!devOnly()) {
      return NextResponse.json(
        { ok: false, error: 'Disabled outside development.' },
        { status: 403 }
      );
    }

    const n = await prisma.person.count();
    if (n > 0) {
      return NextResponse.json({ ok: true, seeded: 0, message: 'Person already has rows; skipping.' });
    }

    const demoFull: Demo = [
      { firstName: 'Ada', lastName: 'Lovelace', industries: ['Computing', 'Mathematics'], location: 'London', role: 'Member' },
      { firstName: 'Grace', lastName: 'Hopper', industries: ['Computing', 'Navy'], location: 'Arlington, VA', role: 'Member' },
      { firstName: 'Alan', lastName: 'Turing', industries: ['Research', 'Computing'], location: 'Wilmslow, UK', role: 'Member' },
    ];

    const demoNoRole: Demo = demoFull.map((d) => {
      const { role, ...rest } = d;
      return rest;
    });

    const demoRoleOnly: Demo = demoFull.map((d) => {
      const { firstName, lastName, role } = d as { firstName: string; lastName: string; role?: string };
      return role ? { firstName, lastName, role } : { firstName, lastName };
    });

    const demoMinimal: Demo = demoFull.map((d) => {
      const { firstName, lastName } = d as { firstName: string; lastName: string };
      return { firstName, lastName };
    });

    const variants: Demo[] = [demoFull, demoNoRole, demoRoleOnly, demoMinimal];

    let used = -1;
    for (let i = 0; i < variants.length; i++) {
      const ok = await tryCreate(variants[i]);
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
