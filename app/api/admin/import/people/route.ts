import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionLoose } from "@/lib/authLoose";
import { readRole } from "@/lib/session";

type Summary = {
  ok: boolean;
  created: number;
  updated: number;
  skipped: number;
  total: number;
  reason?: string | null;
  sample?: Array<Record<string, string>>;
};

const PERSON_CANDIDATES = ["person", "people", "alumni", "user", "member"] as const;

function camelize(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}
function getModel() {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const k of PERSON_CANDIDATES) {
    const m = map.get(k);
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

function parseCSV(raw: string): Array<Record<string, string>> {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = splitCSVLine(lines[0]).map((h) => h.trim());
  const out: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) {
      row[header[c] || `col${c}`] = String(cols[c] ?? "").trim();
    }
    out.push(row);
  }
  return out;
}

function splitCSVLine(line: string): string[] {
  const res: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"' ) {
      if (q && line[i+1] === '"') {
        cur += '"'; i++;
      } else {
        q = !q;
      }
    } else if (ch === "," && !q) {
      res.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  res.push(cur);
  return res;
}

function splitIndustries(src: string): string[] {
  const raw = src.split(/[,;|]/).map((s) => s.trim()).filter((s) => s.length > 0);
  return raw.filter((x): x is string => typeof x === "string");
}

export async function POST(req: Request): Promise<Response> {
  const isPreview = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "preview";
  const allowLocal = process.env.NODE_ENV !== "production" && process.env.ALLOW_LOCAL_PREVIEW_SEED === "true";

  try {
    const session = await getSessionLoose();
    const role = readRole(session);
    if (!session || !session.user || role !== "admin") {
      return NextResponse.json({ ok: false, created: 0, updated: 0, skipped: 0, total: 0, reason: "unauthorized" } as Summary, { status: 200 });
    }
  } catch {
    return NextResponse.json({ ok: false, created: 0, updated: 0, skipped: 0, total: 0, reason: "unauthorized" } as Summary, { status: 200 });
  }

  if (!isPreview && !allowLocal) {
    return NextResponse.json({ ok: false, created: 0, updated: 0, skipped: 0, total: 0, reason: "not-allowed" } as Summary, { status: 200 });
  }

  let text = "";
  try {
    text = await req.text();
  } catch {
    return NextResponse.json({ ok: false, created: 0, updated: 0, skipped: 0, total: 0, reason: "no-body" } as Summary, { status: 200 });
  }
  const rows = parseCSV(text);
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, created: 0, updated: 0, skipped: 0, total: 0, sample: [], reason: null } as Summary, { status: 200 });
  }

  const meta = getModel();
  if (!meta) {
    return NextResponse.json({ ok: true, created: 0, updated: 0, skipped: rows.length, total: rows.length, reason: "no-model", sample: rows.slice(0,3) } as Summary, { status: 200 });
  }
  const fields = new Set(meta.fields.map((f) => f.name));
  const d = getDelegate(meta.name) as {
    create?: (args: unknown) => Promise<unknown>;
    update?: (args: unknown) => Promise<unknown>;
    findFirst?: (args: unknown) => Promise<unknown | null>;
  };

  let created = 0, updated = 0, skipped = 0;

  for (const r of rows) {
    const email = typeof r.email === "string" && r.email.includes("@") ? r.email.trim() : "";
    if (!email) { skipped++; continue; }

    const data: Record<string, unknown> = {};
    if (fields.has("firstName") && typeof r.firstName === "string") data.firstName = r.firstName.trim() || null;
    if (fields.has("lastName") && typeof r.lastName === "string") data.lastName = r.lastName.trim() || null;
    if (fields.has("email")) data.email = email;
    if (fields.has("location") && typeof r.location === "string") data.location = r.location.trim() || null;
    if (fields.has("industries") && typeof r.industries === "string") data.industries = splitIndustries(r.industries);
    if (fields.has("teamSlug") && typeof r.teamSlug === "string") data.teamSlug = r.teamSlug.trim() || null;

    try {
      let existing: Record<string, unknown> | null = null;
      if (has(d, "findFirst")) {
        try {
          const found = await (d.findFirst as (a: unknown) => Promise<unknown | null>)({
            where: { email },
            select: Object.fromEntries(["id"].filter((k) => fields.has(k)).map((k) => [k, true] as const)),
          });
          existing = (found && typeof found === "object") ? (found as Record<string, unknown>) : null;
        } catch {
          existing = null;
        }
      }

      if (existing && has(d, "update")) {
        try {
          await (d.update as (a: unknown) => Promise<unknown>)({
            where: existing,
            data,
            select: Object.fromEntries(["id"].filter((k) => fields.has(k)).map((k) => [k, true] as const)),
          });
          updated++;
          continue;
        } catch {}
      }

      if (has(d, "create")) {
        try {
          await (d.create as (a: unknown) => Promise<unknown>)({
            data,
            select: Object.fromEntries(["id"].filter((k) => fields.has(k)).map((k) => [k, true] as const)),
          });
          created++;
          continue;
        } catch {
          try {
            await (d.create as (a: unknown) => Promise<unknown>)({
              data: { email },
              select: Object.fromEntries(["id"].filter((k) => fields.has(k)).map((k) => [k, true] as const)),
            });
            created++;
            continue;
          } catch {
            skipped++;
          }
        }
      } else {
        skipped++;
      }
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, created, updated, skipped, total: rows.length, sample: rows.slice(0,3), reason: null } as Summary, { status: 200 });
}
