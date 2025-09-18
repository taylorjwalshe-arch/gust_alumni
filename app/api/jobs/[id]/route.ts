import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { has } from "@/lib/has";

type Job = {
  id: string;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  isRequest?: boolean | null;
  postedAt?: Date | null;
};

export async function GET(_req: Request, context: unknown): Promise<Response> {
  const id = (context as { params?: { id?: string } } | undefined)?.params?.id ?? "";

  const empty: Job = {
    id,
    title: null,
    company: null,
    location: null,
    isRequest: null,
    postedAt: null
  };

  const delegateNames = ["job", "jobs", "posting", "post", "opportunity"];
  const model = delegateNames.find((name) => has(prisma, name));
  if (!model) return NextResponse.json(empty);

  try {
    const delegate = ((prisma as unknown) as Record<string, unknown>)[model] as {
      findUnique: (args: unknown) => Promise<unknown>;
    };

    const job = (await delegate.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        isRequest: true,
        postedAt: true
      }
    })) as Partial<Job> | null;

    return NextResponse.json({
      id: String(job?.id ?? id),
      title: job?.title ?? null,
      company: job?.company ?? null,
      location: job?.location ?? null,
      isRequest: job?.isRequest ?? null,
      postedAt: job?.postedAt ? new Date(job.postedAt).toISOString() : null
    });
  } catch {
    return NextResponse.json(empty);
  }
}
