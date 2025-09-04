import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ApiPerson = {
  id: string | number | null;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  expertise: string[] | null;
  location: string | null;
  imageUrl: string | null;
};

const SAFE_EMPTY: ApiPerson = {
  id: null,
  firstName: null,
  lastName: null,
  industries: null,
  expertise: null,
  location: null,
  imageUrl: null,
};

export async function GET(
  _req: Request,
  ctx: { params: { id?: string } }
) {
  try {
    const idParam = ctx?.params?.id ?? "";
    if (!idParam) return NextResponse.json(SAFE_EMPTY);

    // Dynamic import; build won’t fail if Prisma isn’t installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = await import("@prisma/client").catch(() => ({ PrismaClient: null as unknown as any }));
    if (!PrismaClient) return NextResponse.json(SAFE_EMPTY);

    const prisma = new PrismaClient();
    const modelName = (process.env.PRISMA_DIRECTORY_MODEL || "person").toLowerCase();
    const delegate = (prisma as unknown as Record<string, any>)[modelName] ?? (prisma as any).person;
    if (!delegate?.findMany) return NextResponse.json(SAFE_EMPTY);

    const rowsUnknown = await delegate.findMany({});
    const rows = Array.isArray(rowsUnknown) ? (rowsUnknown as Array<Record<string, unknown>>) : [];
    const match = rows.find((r) => String(r?.id) === String(idParam));
    if (!match) return NextResponse.json(SAFE_EMPTY);

    const id =
      typeof match.id === "string" || typeof match.id === "number" ? (match.id as string | number) : null;
    const firstName = typeof match.firstName === "string" ? (match.firstName as string) : null;
    const lastName = typeof match.lastName === "string" ? (match.lastName as string) : null;
    const industries = Array.isArray((match as { industries?: unknown }).industries)
      ? ((match as { industries?: unknown[] }).industries || []).map(String)
      : null;
    const expertise = Array.isArray((match as { expertise?: unknown }).expertise)
      ? ((match as { expertise?: unknown[] }).expertise || []).map(String)
      : null;
    const location = typeof (match as { location?: unknown }).location === "string"
      ? ((match as { location: string }).location)
      : null;
    const imageUrl = typeof (match as { imageUrl?: unknown }).imageUrl === "string"
      ? ((match as { imageUrl: string }).imageUrl)
      : null;

    const payload: ApiPerson = { id, firstName, lastName, industries, expertise, location, imageUrl };
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(SAFE_EMPTY);
  }
}
