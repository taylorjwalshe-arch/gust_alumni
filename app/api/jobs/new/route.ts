import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { has } from "@/lib/has";

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();

  const model = ["job", "jobs", "posting"].find((name) => has(prisma, name));
  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 400 });
  }

  // @ts-expect-error: safe dynamic delegate access
  const delegate = prisma[model];

  const result = await delegate.create({
    data: {
      title: body.title || null,
      company: body.company || null,
      location: body.location || null,
      isRequest: body.isRequest || false,
      postedAt: new Date(),
    },
  });

  return NextResponse.json(result);
}
