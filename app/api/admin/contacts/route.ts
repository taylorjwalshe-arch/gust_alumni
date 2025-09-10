import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionLoose } from "@/lib/authLoose";
import { readRole } from "@/lib/session";

type ContactItem = {
  id: string;
  jobId: string;
  message: string;
  ts: string;
};
type ListOut = {
  items: ContactItem[];
  total: number;
  page: number;
  pageSize: number;
  reason?: string;
};

function safeISO(v: unknown): string {
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  return new Date().toISOString();
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") || "20")));
  const jobId = url.searchParams.get("jobId") || "";
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";

  try {
    const session = await getSessionLoose();
    const role = readRole(session);
    if (!session || !session.user || role !== "admin") {
      return NextResponse.json(
        { items: [], total: 0, page, pageSize, reason: "unauthorized" } as ListOut,
        { status: 200 }
      );
    }
  } catch {
    return NextResponse.json({ items: [], total: 0, page, pageSize, reason: "unauthorized" } as ListOut, { status: 200 });
  }

  try {
    const logFile = path.join("/tmp/job-contacts", "log.jsonl");
    if (!fs.existsSync(logFile)) {
      return NextResponse.json({ items: [], total: 0, page, pageSize } as ListOut, { status: 200 });
    }
    const raw = fs.readFileSync(logFile, "utf8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    const parsed: ContactItem[] = [];
    for (let i = 0; i < lines.length; i++) {
      try {
        const o = JSON.parse(lines[i]) as Record<string, unknown>;
        const id = typeof o.id === "string" || typeof o.id === "number" ? String(o.id) : "";
        const msg = typeof o.message === "string" ? o.message : "";
        const ts = safeISO(o.ts);
        if (!id || !msg) continue;
        parsed.push({ id: String(i), jobId: id, message: msg, ts });
      } catch {}
    }

    let filtered = parsed;
    if (jobId) filtered = filtered.filter((r) => r.jobId === jobId);
    if (from) {
      const f = new Date(from).getTime();
      if (!isNaN(f)) filtered = filtered.filter((r) => new Date(r.ts).getTime() >= f);
    }
    if (to) {
      const t = new Date(to).getTime();
      if (!isNaN(t)) filtered = filtered.filter((r) => new Date(r.ts).getTime() <= t);
    }

    filtered.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return NextResponse.json({ items, total, page, pageSize } as ListOut, { status: 200 });
  } catch {
    return NextResponse.json({ items: [], total: 0, page, pageSize } as ListOut, { status: 200 });
  }
}
