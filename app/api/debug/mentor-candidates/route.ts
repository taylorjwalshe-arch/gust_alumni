// app/api/debug/mentor-candidates/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  const client = prisma as unknown as Record<string, any>;
  const names = Object.keys(client).filter((k) => !k.startsWith('$'));
  const models: Array<{ name: string; keys: string[] }> = [];

  for (const name of names) {
    const m = client[name];
    if (!m || typeof m !== 'object') continue;
    try {
      // @ts-expect-error dynamic delegate
      const row = await m.findFirst({}); // may throw if not a model
      const keys = row ? Object.keys(row) : [];
      models.push({ name, keys });
    } catch {
      models.push({ name, keys: [] });
    }
  }

  return NextResponse.json({ models });
}
