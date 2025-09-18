import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type LogEntry = {
  id: string;
  mentorId: string;
  action: "accept" | "skip" | "contact";
  at: string;
};

const LOG_PATH = path.join("/tmp", "mentor-log.json");

function safeRead(): LogEntry[] {
  try {
    if (!fs.existsSync(LOG_PATH)) return [];
    const raw = fs.readFileSync(LOG_PATH, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as unknown[]).filter((x): x is LogEntry => {
      if (!x || typeof x !== "object") return false;
      const r = x as Record<string, unknown>;
      return typeof r.id === "string" && typeof r.mentorId === "string" && typeof r.action === "string" && typeof r.at === "string";
    }) : [];
  } catch {
    return [];
  }
}

function safeWrite(entries: LogEntry[]): boolean {
  try {
    fs.writeFileSync(LOG_PATH, JSON.stringify(entries.slice(-200), null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function GET(): Promise<Response> {
  const items = safeRead().slice(-20).reverse();
  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const mentorId = typeof payload.mentorId === "string" && payload.mentorId.trim() ? payload.mentorId.trim() : null;
    const actionRaw = typeof payload.action === "string" ? payload.action : "";
    const action = actionRaw === "accept" || actionRaw === "skip" || actionRaw === "contact" ? actionRaw : null;
    if (!mentorId || !action) return NextResponse.json({ saved: false }, { status: 200 });

    const entry: LogEntry = { id: crypto.randomUUID(), mentorId, action, at: new Date().toISOString() };
    const list = safeRead();
    list.push(entry);
    const ok = safeWrite(list);
    return NextResponse.json({ saved: ok }, { status: 200 });
  } catch {
    return NextResponse.json({ saved: false }, { status: 200 });
  }
}
