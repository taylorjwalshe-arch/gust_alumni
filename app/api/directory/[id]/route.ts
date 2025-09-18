import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, context: unknown): Promise<Response> {
  const id = (context as { params?: { id?: string } } | undefined)?.params?.id ?? "";

  const empty = {
    id,
    firstName: null,
    lastName: null,
    location: null,
    industries: null,
    imageUrl: null
  };

  try {
    const person = await prisma.person.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        location: true,
        industries: true
      }
    });

    return NextResponse.json({
      id: person?.id ?? id,
      firstName: person?.firstName ?? null,
      lastName: person?.lastName ?? null,
      location: person?.location ?? null,
      industries: Array.isArray(person?.industries)
        ? person.industries.filter((x): x is string => typeof x === "string")
        : null,
      imageUrl: null
    });
  } catch {
    return NextResponse.json(empty);
  }
}
