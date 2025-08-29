// app/api/debug/prisma-models/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// List the delegate names on the Prisma client (e.g., profile, user, etc.)
export async function GET() {
  const keys = Object.keys(prisma as unknown as Record<string, unknown>)
    .filter((k) => !k.startsWith('$'));
  return NextResponse.json({ delegates: keys });
}
