import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  // 1) Get session safely — NO import from "@/auth"
  let session: import("next-auth").Session | null = null;
  try {
    session = await getServerSession();
  } catch {
    session = null;
  }

  // 2) Signed-out experience (never throws)
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

  // 3) Find the Person by userId (best) or email (fallback) using findFirst
  const userId = (session.user as { id?: string } | undefined)?.id;
  const email = session.user.email ?? undefined;

  let me:
    | {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        role: string;
        industries: unknown;
        company: string | null;
        location: string | null;
      }
    | null = null;

  try {
    me = await prisma.person.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        industries: true,
        company: true,
        location: true,
      },
    });
  } catch {
    me = null;
  }

  if (!me) {
    return (
      <main className="max-w-2xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          We couldn’t find a profile for {email ?? "this account"}.
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
