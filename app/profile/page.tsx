import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { authOptions } from "@/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  // Not signed in → simple prompt
  if (!session?.user?.email) {
    return (
      <main className="max-w-2xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p>You’re not signed in.</p>
        <div className="flex gap-3">
          <Link href="/api/auth/signin" className="text-blue-600 underline">
            Sign in
          </Link>
          <Link href="/directory" className="text-blue-600 underline">
            Back to Directory
          </Link>
        </div>
      </main>
    );
  }

  // Look up the logged-in user's Person record by email
  const me = await prisma.person.findFirst({
    where: { email: session.user.email },
  });

  if (!me) {
    return (
      <main className="max-w-2xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p>No profile found for {session.user.email}.</p>
        <div className="flex gap-3">
          <Link href="/directory" className="text-blue-600 underline">
            Back to Directory
          </Link>
          <Link href="/api/auth/signout" className="text-blue-600 underline">
            Sign out
          </Link>
        </div>
      </main>
    );
  }

  const industries = (me.industries as unknown as string[] | null) ?? [];

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
