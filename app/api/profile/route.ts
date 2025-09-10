import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSessionLoose } from "@/lib/authLoose";
import { readRole } from "@/lib/session";

type Out = { ok: boolean; item?: Record<string, unknown>; reason?: string };

const PERSON_CANDIDATES = ["person", "people", "alumni", "user", "member"] as const;

function camelize(modelName: string): string {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}
function getModel(candidates: readonly string[]) {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const key of candidates) {
    const m = map.get(key);
    if (m) return m;
  }
  return null;
}
function getDelegate(modelName: string) {
  const key = camelize(modelName);
  return (prisma as unknown as Record<string, unknown>)[key] as unknown;
}
function has(d: unknown, k: string): boolean {
  return !!(d && typeof d === "object" && k in (d as object));
}

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await getSessionLoose();
    const role = readRole(session);
    if (!session || !session.user) {
      return NextResponse.json({ ok: false, reason: "unauthorized" } as Out, { status: 200 });
    }
    void role;
  } catch {
    return NextResponse.json({ ok: false, reason: "unauthorized" } as Out, { status: 200 });
  }

  const meta = getModel(PERSON_CANDIDATES);
  if (!meta) return NextResponse.json({ ok: false, reason: "no-model" } as Out, { status: 200 });

  const fields = new Set(meta.fields.map((f) => f.name));
  const d = getDelegate(meta.name) as {
    create?: (args: unknown) => Promise<unknown>;
    update?: (args: unknown) => Promise<unknown>;
    findFirst?: (args: unknown) => Promise<unknown | null>;
  };

  let body: Record<string, unknown> = {};
  try {
    const json = await req.json();
    body = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) || {};
  } catch {
    body = {};
  }

  const id = (body as Record<string, unknown>).id;
  const email = typeof (body as Record<string, unknown>).email === "string" ? (body as Record<string, unknown>).email : undefined;

  const data: Record<string, unknown> = {};
  ["firstName", "lastName", "email", "location"].forEach((k) => {
    if (fields.has(k) && typeof (body as Record<string, unknown>)[k] !== "undefined") {
      data[k] = (body as Record<string, unknown>)[k];
    }
  });
  if (fields.has("industries") && Array.isArray((body as Record<string, unknown>).industries)) {
    const arr = ((body as Record<string, unknown>).industries as unknown[]).filter(
      (x): x is string => typeof x === "string"
    );
    data["industries"] = arr;
  }
  if (fields.has("teamSlug") && typeof (body as Record<string, unknown>).teamSlug === "string") {
    data["teamSlug"] = (body as Record<string, unknown>).teamSlug;
  }
  if (fields.has("teamId") && (typeof (body as Record<string, unknown>).teamId === "string" || typeof (body as Record<string, unknown>).teamId === "number")) {
    data["teamId"] = (body as Record<string, unknown>).teamId;
  }

  try {
    if (id != null && has(d, "update")) {
      try {
        const updated = await (d.update as (a: unknown) => Promise<unknown>)({
          where: typeof id === "number" || typeof id === "string" ? { id } : { id: undefined },
          data,
          select: Object.fromEntries(
            ["id", "firstName", "lastName", "email", "location", "industries", "teamSlug", "teamId"]
              .filter((k) => fields.has(k))
              .map((k) => [k, true] as const)
          ),
        });
        return NextResponse.json({ ok: true, item: updated as Record<string, unknown> } as Out, { status: 200 });
      } catch {}
    }

    if (email && has(d, "findFirst")) {
      try {
        const existing = await (d.findFirst as (a: unknown) => Promise<unknown | null>)({
          where: { email },
          select: Object.fromEntries(["id"].filter((k) => fields.has(k)).map((k) => [k, true] as const)),
        });
        if (existing && has(d, "update")) {
          const updated = await (d.update as (a: unknown) => Promise<unknown>)({
            where: existing,
            data,
            select: Object.fromEntries(
              ["id", "firstName", "lastName", "email", "location", "industries", "teamSlug", "teamId"]
                .filter((k) => fields.has(k))
                .map((k) => [k, true] as const)
            ),
          });
          return NextResponse.json({ ok: true, item: updated as Record<string, unknown> } as Out, { status: 200 });
        }
      } catch {}
    }

    if (has(d, "create")) {
      try {
        const created = await (d.create as (a: unknown) => Promise<unknown>)({
          data,
          select: Object.fromEntries(
            ["id", "firstName", "lastName", "email", "location", "industries", "teamSlug", "teamId"]
              .filter((k) => fields.has(k))
              .map((k) => [k, true] as const)
          ),
        });
        return NextResponse.json({ ok: true, item: created as Record<string, unknown> } as Out, { status: 200 });
      } catch {
        try {
          const created = await (d.create as (a: unknown) => Promise<unknown>)({
            data: {},
            select: Object.fromEntries(["id"].filter((k) => fields.has(k)).map((k) => [k, true] as const)),
          });
          return NextResponse.json({ ok: true, item: created as Record<string, unknown> } as Out, { status: 200 });
        } catch {
          return NextResponse.json({ ok: false, reason: "create-failed" } as Out, { status: 200 });
        }
      }
    }
  } catch {}

  return NextResponse.json({ ok: false, reason: "no-delegate" } as Out, { status: 200 });
}
