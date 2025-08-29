import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import type { Session, NextAuthOptions } from "next-auth";
import { authOptions } from "@/auth";
import type { Person } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  // 1) Get the session (fully typed; no "any")
  const session: Session | null = await getServerSession(
    authOptions as NextAuthOptions
  );

  // 2) Signed-out = gentle page, no crashes
  if (!session?.user) {
    return (
      <main className="max-w-2xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          You need to sign in to view your profile.
        </p>
        <Link href="/api/auth/signin" className="text-blue-600 underline">
          Sign in
        </Link>
      </main>
    );
  }

  // 3) Try by userId (best), then fall back to email — use findFirst to avoid Prisma
  //    throwing if the field is not unique or is null.
  const userId = (session.user as unknown as { id?: string })?.id ?? undefined;
  const email = session.user.email ?? undefined;

  let me: Person | null = null;
  try {
    me = await prisma.person.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });
  } catch {
    // swallow DB errors and render a safe message below
    me = null;
  }

  if (!me) {
    return (
      <main className="max-w-2xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          We couldn’t find a profile for{" "}
          <strong>{email ?? "this account"}</strong>.
        </p>
        <div className="pt-4 flex gap-3">
          <Link href="/directory" className="text-blue-600 underline">
            ← Back to Directory
          </Link>
          <Link href="/api/auth/signout" className="text-blue-600 underline">
            Sign out
          </Link>
        </div>
      </main>
    );
  }

  const industries = Array.isArray(me.industries)
    ? (me.industries as unknown as string[])
    : [];

  return (
    <main className="max-w-2xl mx-auto py-12 space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="space-y-1">
        <div className="font-medium">Name</div>
        <div>
          {me.firstName} {me.lastName}
        </div>
      </div>

      <div className="space-y-1">
        <div className="font-medium">Email</div>
        <div>{me.email ?? "—"}</div>
      </div>

      <div className="space-y-1">
        <div className="font-medium">Role</div>
        <div>{me.role}</div>
      </div>

      <div className="space-y-1">
        <div className="font-medium">Industries</div>
        <div>{industries.length ? industries.join(", ") : "—"}</div>
      </div>

      <div className="space-y-1">
        <div className="font-medium">Company</div>
        <div>{me.company ?? "—"}</div>
      </div>

      <div className="space-y-1">
        <div className="font-medium">Location</div>
        <div>{me.location ?? "—"}</div>
      </div>

      <div className="pt-4 flex gap-3">
        <Link href="/api/auth/signout" className="text-blue-600 underline">
          Sign out
        </Link>
        <Link href="/directory" className="text-blue-600 underline">
          Back to Directory
        </Link>
      </div>
    </main>
  );
}
