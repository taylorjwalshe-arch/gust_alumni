export type LooseSession = {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
  } | null;
} | null;

export async function getSessionLoose(): Promise<LooseSession> {
  // Try NextAuth v5-style `auth()` if present
  try {
    const mod: unknown = await import("next-auth");
    const maybeAuth = (mod as Record<string, unknown> | null)?.["auth"];
    if (typeof maybeAuth === "function") {
      const s = await (maybeAuth as () => Promise<unknown>)();
      return (s ?? null) as LooseSession;
    }
  } catch {}

  // Fallback to NextAuth v4-style `getServerSession`
  try {
    const mod: unknown = await import("next-auth");
    const nextMod: unknown = await import("next-auth/next");
    const a = (mod as Record<string, unknown> | null)?.["getServerSession"];
    const b = (nextMod as Record<string, unknown> | null)?.["getServerSession"];
    const getServerSession =
      (typeof a === "function" ? (a as () => Promise<unknown>) : null) ||
      (typeof b === "function" ? (b as () => Promise<unknown>) : null);

    if (getServerSession) {
      const s = await getServerSession();
      return (s ?? null) as LooseSession;
    }
  } catch {}

  return null;
}
