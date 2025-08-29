import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

// Simple Input/Label stand-ins to avoid import churn.
// If you already have shadcn/ui versions, you can keep them.
function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="block text-sm font-medium mb-1" {...props} />;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full rounded-md border p-2" {...props} />;
}

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);

  // If no session, render a safe sign-in prompt (no crashes).
  if (!session || !session.user?.email) {
    return (
      <main className="max-w-2xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          You’re not signed in.
        </p>
        <a
          href="/api/auth/signin"
          className="inline-block border rounded-xl px-4 py-2 hover:bg-muted"
        >
          Sign in with GitHub
        </a>
      </main>
    );
  }

  // Find person by userId (create a shell record if missing so the form works)
  const userId = (session.user as any).id as string | undefined;
  let me = userId
    ? await prisma.person.findUnique({ where: { userId } })
    : null;

  if (!me) {
    // Try by email as fallback (in case we seeded by email only)
    me = await prisma.person.findUnique({ where: { email: session.user.email! } });
  }

  if (!me && userId) {
    me = await prisma.person.create({
      data: {
        userId,
        firstName: session.user.name?.split(" ")[0] ?? "First",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "Last",
        email: session.user.email ?? undefined,
        role: "alumni",
      },
    });
  }

  // If still nothing, show a soft message instead of throwing
  if (!me) {
    return (
      <main className="max-w-2xl mx-auto py-12 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm">
          We couldn’t locate or create your profile automatically.
        </p>
        <a href="/api/auth/signout" className="text-blue-600 underline">
          Sign out
        </a>
      </main>
    );
  }

  // Render a minimal read-only snapshot (your existing edit form is fine too)
  const industries =
    Array.isArray(me.industries) ? (me.industries as string[]) : [];

  return (
    <main className="max-w-2xl mx-auto py-12 space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="space-y-1">
        <Label>Name</Label>
        <div>{me.firstName} {me.lastName}</div>
      </div>

      <div className="space-y-1">
        <Label>Email</Label>
        <div>{me.email ?? "—"}</div>
      </div>

      <div className="space-y-1">
        <Label>Role</Label>
        <div>{me.role}</div>
      </div>

      <div className="space-y-1">
        <Label>Industries</Label>
        <div>{industries.length ? industries.join(", ") : "—"}</div>
      </div>

      <div className="space-y-1">
        <Label>Company</Label>
        <div>{me.company ?? "—"}</div>
      </div>

      <div className="space-y-1">
        <Label>Location</Label>
        <div>{me.location ?? "—"}</div>
      </div>

      <div className="pt-4 flex gap-3">
        <a href="/api/auth/signout" className="text-blue-600 underline">Sign out</a>
        <Link href="/directory" className="text-blue-600 underline">Back to Directory</Link>
      </div>
    </main>
  );
}
