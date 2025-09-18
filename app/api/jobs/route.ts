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

type DelegateWithFindMany = {
  findMany: (args: unknown) => Promise<unknown[]>;
};

export async function GET() {
  const fallback = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 100
  };

  const delegateNames = ["job", "jobs", "posting", "post", "opportunity"];
  const model = delegateNames.find((name) => has(prisma, name));
  if (!model) return NextResponse.json(fallback);

  try {
    const delegate = ((prisma as unknown) as Record<string, unknown>)[model] as DelegateWithFindMany;

    const result = await delegate.findMany({
      take: 100,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        isRequest: true,
        postedAt: true
      }
    });

    const items = (result as Job[]).map((job) => ({
      id: String(job.id),
      title: job.title ?? null,
      company: job.company ?? null,
      location: job.location ?? null,
      isRequest: job.isRequest ?? null,
      postedAt: job.postedAt ? new Date(job.postedAt).toISOString() : null
    }));

    return NextResponse.json({
      items,
      total: items.length,
      page: 1,
      pageSize: 100
    });
  } catch {
    return NextResponse.json(fallback);
  }
}
