// app/api/debug/mentor-candidates/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

type MaybeDelegate = { findFirst?: (args?: unknown) => Promise<unknown> };

export async function GET() {
  const client = prisma as unknown as Record<string, unknown>;
  const names = Object.keys(client).filter((k) => !k.startsWith('$'));
  const models: Array<{ name: string; keys: string[] }> = [];

  for (const name of names) {
    const m = client[name];
    if (!m || typeof m !== 'object') continue;
    try {
      const delegate = m as unknown as MaybeDelegate;
      const row = delegate.findFirst ? await delegate.findFirst({}) : null;
      const keys = row ? Object.keys(row as Record<string, unknown>) : [];
      models.push({ name, keys });
    } catch {
      models.push({ name, keys: [] });
    }
  }

  return NextResponse.json({ models });
}
