import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import type { Session, NextAuthOptions } from "next-auth";
import { authOptions } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  // Properly typed session (no "any")
  const session: Session | null = await getServerSession(
    authOptions as NextAuthOptions
  );

  // Signed-out experience (no exception)
  if (!session?.user?.email) {
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

  const me =
    (await prisma.person.findUnique({
      where: { email: session.user.email },
    })) ?? null;

  if (!me) {
    return (
      <main className="max-w-2xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          No profile found for <strong>{session.user.email}</strong>.
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
