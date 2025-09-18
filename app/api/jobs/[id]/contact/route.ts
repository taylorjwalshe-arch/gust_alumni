import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request, context: unknown): Promise<Response> {
  const id = (context as { params?: { id?: string } } | undefined)?.params?.id || "";
  let message = "";
  try {
    const json = await req.json();
    if (json && typeof json.message === "string") {
      message = json.message.trim();
    }
  } catch {}

  if (!id || !message) {
    return NextResponse.json({ ok: false, reason: "missing-id-or-message" }, { status: 200 });
  }

  try {
    const logDir = "/tmp/job-contacts";
    const logFile = path.join(logDir, "log.jsonl");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const entry = {
      id,
      message,
      ts: new Date().toISOString(),
    };
    fs.appendFileSync(logFile, JSON.stringify(entry) + "\n");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, reason: "log-failed" }, { status: 200 });
  }
}
