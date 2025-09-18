// app/api/_debug/prisma-models/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const keys = Object.keys(prisma as unknown as Record<string, unknown>)
    .filter((k) => !k.startsWith('$'));
  return NextResponse.json({ delegates: keys });
}
