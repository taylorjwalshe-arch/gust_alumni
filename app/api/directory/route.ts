import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Row = { id?: string | number | null; firstName?: string | null; lastName?: string | null };
type Out = { id: string | number; firstName: string | null; lastName: string | null };

const SAFE_EMPTY: Out[] = [];

async function tryFetch(): Promise<Out[]> {
  try {
    const { PrismaClient } = await import("@prisma/client").catch(() => ({ PrismaClient: null as unknown as any }));
    if (!PrismaClient) return SAFE_EMPTY;

    const prisma = new PrismaClient();
    const modelName = (process.env.PRISMA_DIRECTORY_MODEL || "person").toLowerCase();
    const delegate = (prisma as unknown as Record<string, any>)[modelName] ?? (prisma as any).person;
    if (!delegate?.findMany) return SAFE_EMPTY;

    const rows = (await delegate.findMany({ select: { id: true, firstName: true, lastName: true } })) as Row[];
    return (rows || [])
      .filter((r) => r && (typeof r.id === "string" || typeof r.id === "number"))
      .map((r) => ({
        id: r.id as string | number,
        firstName: typeof r.firstName === "string" ? r.firstName : null,
        lastName: typeof r.lastName === "string" ? r.lastName : null,
      }));
  } catch {
    return SAFE_EMPTY;
  }
}

export async function GET() {
  const data = await tryFetch();
  return NextResponse.json(data);
}
