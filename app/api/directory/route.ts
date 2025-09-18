import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const fields = { id: true, firstName: true, lastName: true };

export async function GET() {
  try {
    const items = await prisma.person.findMany({ select: fields });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
