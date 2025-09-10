import type { LooseSession } from "./authLoose";
export function readRole(session: LooseSession): "student" | "alum" | "admin" {
  const r =
    (session &&
      typeof session === "object" &&
      (session as { user?: { role?: unknown } }).user &&
      (session as { user?: { role?: unknown } }).user?.role) || null;
  if (r === "student" || r === "admin" || r === "alum") return r;
  return "alum";
}
