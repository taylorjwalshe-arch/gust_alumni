import { NextResponse } from "next/server";
import { getSessionLoose } from "@/lib/authLoose";
import { readRole } from "@/lib/session";

export async function GET(_req: Request, _ctx: unknown): Promise<Response> {
  try {
    const s = await getSessionLoose();
    const authed = !!(s && s.user && s.user.email);
    const email = authed ? String(s.user?.email || "") : null;
    const role = authed ? readRole(s) : null;
    return NextResponse.json({ authed, email, role }, { status: 200 });
  } catch {
    return NextResponse.json({ authed: false, email: null, role: null }, { status: 200 });
  }
}
