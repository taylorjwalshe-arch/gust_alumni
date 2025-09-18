import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getSessionLoose } from "@/lib/authLoose";

type Suggestion = { id: string; name: string | null } | null;
type HistoryItem = { id: string; mentorId: string; action: string; note: string | null; ts: string };
type Out = { week: string; suggestion: Suggestion; history: HistoryItem[]; reason?: string };

const MENTOR_CANDIDATES = ["mentor", "mentors", "candidate", "candidates", "person", "people", "alumni", "user", "member"] as const;

function camelize(modelName: string): string {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}
function getModel() {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const key of MENTOR_CANDIDATES) {
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
function normId(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "bigint") return String(v);
  return "";
}
function nameFrom(row: Record<string, unknown>): string | null {
  const f = typeof row.firstName === "string" ? row.firstName : null;
  const l = typeof row.lastName === "string" ? row.lastName : null;
  const n = typeof row.name === "string" ? row.name : null;
  if (n) return n;
  if (f && l) return `${f} ${l}`;
  if (f) return f;
  if (l) return l;
  return null;
}
function iso(v: Date | string | unknown): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  return new Date().toISOString();
}
function weekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
async function userKey(): Promise<string> {
  try {
    const s = await getSessionLoose();
    const email = s && s.user && typeof (s.user as { email?: unknown }).email === "string" ? String((s.user as { email?: unknown }).email).toLowerCase() : null;
    if (email) return `email:${email}`;
  } catch {}
  return "anon";
}
function hashToInt(input: string, mod: number): number {
  const h = crypto.createHash("sha256").update(input).digest();
  const val = h.readUInt32BE(0);
  return mod > 0 ? val % mod : 0;
}
function logPath(): string {
  const dir = "/tmp";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "mentor-matches.log.jsonl");
}

export async function GET(_req: Request): Promise<Response> {
  const wk = weekKey();
  const ukey = await userKey();

  let suggestion: Suggestion = null;

  try {
    const meta = getModel();
    if (meta) {
      const d = getDelegate(meta.name) as { count?: (a: unknown) => Promise<number>; findMany?: (a: unknown) => Promise<unknown[]> };
      const fields = new Set(meta.fields.map((f) => f.name));
      const select: Record<string, true> = {};
      ["id", "firstName", "lastName", "name"].forEach((k) => {
        if (fields.has(k)) (select as Record<string, true>)[k] = true;
      });
      const MIN: Record<string, true> = {};
      if (fields.has("id")) (MIN as Record<string, true>)["id"] = true;

      let total = 0;
      try {
        total = has(d, "count") ? await (d.count as (a: unknown) => Promise<number>)({}) : 0;
      } catch {
        total = 0;
      }

      if (total > 0 && has(d, "findMany")) {
        const idx = hashToInt(`${wk}:${ukey}`, total);
        let row: unknown | null = null;
        try {
          const rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
            take: 1,
            skip: idx,
            select: Object.keys(select).length ? select : MIN,
          });
          row = rows[0] ?? null;
        } catch {
          const rows = await (d.findMany as (a: unknown) => Promise<unknown[]>)({
            take: 1,
            select: MIN,
          });
          row = rows[0] ?? null;
        }
        if (row && typeof row === "object") {
          const r = row as Record<string, unknown>;
          suggestion = { id: normId(r.id), name: nameFrom(r) };
        }
      }
    }
  } catch {}

  const history: HistoryItem[] = [];
  try {
    const file = logPath();
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf8");
      const lines = raw.split("\n").filter((l) => l.trim().length > 0);
      for (const line of lines) {
        try {
          const o = JSON.parse(line) as Record<string, unknown>;
          if (o.userKey !== ukey) continue;
          const mentorId = normId(o.mentorId);
          const action = typeof o.action === "string" ? o.action : "";
          const note = typeof o.note === "string" ? o.note : null;
          const ts = iso(o.ts);
          if (!mentorId || !action) continue;
          history.push({ id: `${mentorId}-${ts}`, mentorId, action, note, ts });
        } catch {}
      }
    }
  } catch {}

  history.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
  return NextResponse.json({ week: wk, suggestion, history } as Out, { status: 200 });
}

export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    const json = await req.json();
    body = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) || {};
  } catch {
    body = {};
  }
  const mentorId = normId(body.mentorId);
  const action = typeof body.action === "string" ? body.action : "";
  const note = typeof body.note === "string" ? body.note : null;
  if (!mentorId || !action) {
    return NextResponse.json({ ok: false, reason: "missing-fields" }, { status: 200 });
  }
  const ukey = await userKey();
  try {
    const file = logPath();
    const entry = { userKey: ukey, mentorId, action, note, ts: new Date().toISOString() };
    fs.appendFileSync(file, JSON.stringify(entry) + "\n");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, reason: "log-failed" }, { status: 200 });
  }
}
