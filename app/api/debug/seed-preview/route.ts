import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type CreateManyResult = { count: number };

type ReadDelegate = {
  findMany: (args?: unknown) => Promise<unknown[]>;
};
type WriteDelegate = {
  create: (args: unknown) => Promise<unknown>;
  createMany?: (args: unknown) => Promise<CreateManyResult>;
};

function camelize(modelName: string): string {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

function getModelAndFields(candidates: readonly string[]) {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const key of candidates) {
    const m = map.get(key);
    if (m) {
      return { modelName: m.name, fields: new Set(m.fields.map((f) => f.name)) };
    }
  }
  return null;
}

function getDelegate(modelName: string) {
  const key = camelize(modelName);
  const d = (prisma as unknown as Record<string, unknown>)[key];
  return d as unknown;
}

function hasRead(d: unknown): d is ReadDelegate {
  if (!d || typeof d !== "object") return false;
  const o = d as { findMany?: unknown };
  return typeof o.findMany === "function";
}

function hasWrite(d: unknown): d is WriteDelegate {
  if (!d || typeof d !== "object") return false;
  const o = d as { create?: unknown };
  return typeof o.create === "function";
}

function pick(obj: Record<string, unknown>, fields: Set<string>) {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) {
    if (fields.has(k)) out[k] = obj[k];
  }
  return out;
}

function samplePeople() {
  const teamSlug = "georgetown-sailing";
  return [
    { firstName: "Alex", lastName: "Rivera", email: "alex.rivera@example.com", location: "Washington, DC", industries: ["Tech"], teamSlug },
    { firstName: "Jordan", lastName: "Lee", email: "jordan.lee@example.com", location: "New York, NY", industries: ["Finance"], teamSlug },
    { firstName: "Casey", lastName: "Ng", email: "casey.ng@example.com", location: "Boston, MA", industries: ["Consulting"], teamSlug },
    { firstName: "Taylor", lastName: "Brooks", email: "taylor.brooks@example.com", location: "San Francisco, CA", industries: ["Product"], teamSlug },
    { firstName: "Riley", lastName: "Shah", email: "riley.shah@example.com", location: "Chicago, IL", industries: ["Sales"], teamSlug },
  ];
}

function sampleJobs() {
  const now = Date.now();
  const teamSlug = "georgetown-sailing";
  return [
    { title: "Software Engineer", company: "Acme", location: "NYC, NY", isRequest: false, postedAt: new Date(now - 1 * 864e5), teamSlug },
    { title: "Analyst", company: "Goliath Capital", location: "New York, NY", isRequest: false, postedAt: new Date(now - 2 * 864e5), teamSlug },
    { title: "PM", company: "Meta", location: "Seattle, WA", isRequest: false, postedAt: new Date(now - 3 * 864e5), teamSlug },
    { title: "Tech Sales (Request)", company: null, location: "Remote", isRequest: true, postedAt: new Date(now - 4 * 864e5), teamSlug },
    { title: "Design Intern", company: "Figma", location: "SF, CA", isRequest: false, postedAt: new Date(now - 5 * 864e5), teamSlug },
  ];
}

function isoOrNull(v: unknown): string | null {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

export async function POST(req: Request): Promise<Response> {
  const token = req.headers.get("x-seed-token") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expected = process.env.SEED_TOKEN || "";
  const isPreview = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "preview";
  const allowLocal = process.env.NODE_ENV !== "production" && process.env.ALLOW_LOCAL_PREVIEW_SEED === "true";

  if (!token || !expected || token !== expected) {
    return NextResponse.json({ seeded: false, reason: "Unauthorized" }, { status: 200 });
  }
  if (!isPreview && !allowLocal) {
    return NextResponse.json({ seeded: false, reason: "Not allowed in this environment" }, { status: 200 });
  }

  const peopleMeta = getModelAndFields(["person", "people", "alumni", "user", "member"]);
  const jobsMeta = getModelAndFields(["job", "jobs", "posting", "post", "opportunity"]);

  let peopleCount = 0;
  let jobsCount = 0;

  try {
    if (peopleMeta) {
      const d = getDelegate(peopleMeta.modelName);
      if (hasWrite(d)) {
        const rows = samplePeople().map((r) => pick(r as Record<string, unknown>, peopleMeta.fields));
        try {
          const res = d.createMany ? await d.createMany({ data: rows }) : ({ count: 0 } as CreateManyResult);
          peopleCount = res?.count ?? 0;
          if (!d.createMany) throw new Error("no createMany");
        } catch {
          let c = 0;
          for (const r of rows) {
            try {
              await d.create({ data: r });
              c++;
            } catch {}
          }
          peopleCount = Math.max(peopleCount, c);
        }
      }
    }

    let personIds: string[] = [];
    if (peopleMeta) {
      const d = getDelegate(peopleMeta.modelName);
      if (hasRead(d)) {
        try {
          const rows = await d.findMany({ take: 5, select: { id: true } as unknown });
          personIds = (rows ?? [])
            .map((r) => (r && typeof (r as Record<string, unknown>).id !== "undefined" ? String((r as Record<string, unknown>).id) : ""))
            .filter(Boolean);
        } catch {
          personIds = [];
        }
      }
    }

    if (jobsMeta) {
      const d = getDelegate(jobsMeta.modelName);
      if (hasWrite(d)) {
        const rows = sampleJobs().map((r, i) => {
          const base = pick(r as Record<string, unknown>, jobsMeta.fields);
          if (jobsMeta.fields.has("postedAt")) {
            const iso = isoOrNull(base.postedAt);
            base.postedAt = iso ? new Date(iso) : new Date();
          }
          if (jobsMeta.fields.has("posterId") && personIds.length) {
            base.posterId = personIds[i % personIds.length];
          }
          return base;
        });
        try {
          const res = d.createMany ? await d.createMany({ data: rows }) : ({ count: 0 } as CreateManyResult);
          jobsCount = res?.count ?? 0;
          if (!d.createMany) throw new Error("no createMany");
        } catch {
          let c = 0;
          for (const r of rows) {
            try {
              await d.create({ data: r });
              c++;
            } catch {}
          }
          jobsCount = Math.max(jobsCount, c);
        }
      }
    }

    return NextResponse.json(
      {
        seeded: true,
        environment: isPreview ? "preview" : allowLocal ? "local" : "unknown",
        peopleModel: peopleMeta ? peopleMeta.modelName : null,
        jobsModel: jobsMeta ? jobsMeta.modelName : null,
        counts: { people: peopleCount, jobs: jobsCount },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        seeded: false,
        environment: isPreview ? "preview" : allowLocal ? "local" : "unknown",
        peopleModel: peopleMeta ? peopleMeta.modelName : null,
        jobsModel: jobsMeta ? jobsMeta.modelName : null,
        counts: { people: peopleCount, jobs: jobsCount },
      },
      { status: 200 }
    );
  }
}
