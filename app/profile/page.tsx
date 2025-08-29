import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toCsv(value: unknown): string {
  if (!value) return "";
  try {
    const arr = Array.isArray(value) ? value : JSON.parse(String(value));
    return Array.isArray(arr) ? arr.join(", ") : "";
  } catch {
    return "";
  }
}

export const revalidate = 0;

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <main className="p-10 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Please sign in to edit your profile.
        </p>
        <Link
          href="/api/auth/signin"
          className="inline-block border rounded-xl px-4 py-2 hover:bg-muted"
        >
          Sign in with GitHub
        </Link>
      </main>
    );
  }

  // Look up (or create) the Person linked to this user
  const email = session.user.email!;
  let me = await prisma.person.findFirst({ where: { email } });
  if (!me) {
    me = await prisma.person.create({
      data: {
        email,
        firstName: session.user.name?.split(" ")[0] ?? "First",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "Last",
        role: "alumni",
      },
    });
  }

  const defaultIndustries = toCsv(me.industries);
  const defaultExpertise = toCsv(me.expertise);

  async function saveProfile(formData: FormData) {
    "use server";
    const industriesCsv = (formData.get("industries") as string | null) ?? "";
    const expertiseCsv = (formData.get("expertise") as string | null) ?? "";

    await prisma.person.update({
      where: { id: me!.id },
      data: {
        firstName: (formData.get("firstName") as string) || "",
        lastName: (formData.get("lastName") as string) || "",
        role: (formData.get("role") as string) || "alumni",
        gradYear: Number(formData.get("gradYear")) || null,
        company: (formData.get("company") as string) || null,
        location: (formData.get("location") as string) || null,
        priorExperience: (formData.get("priorExperience") as string) || null,
        bio: (formData.get("bio") as string) || null,
        teamAffiliation: (formData.get("teamAffiliation") as string) || null,
        contactPermission: formData.get("contactPermission") === "on",
        industries:
          industriesCsv
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
        expertise:
          expertiseCsv
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
      },
    });
  }

  return (
    <main className="p-10 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Link
          href="/api/auth/signout"
          className="text-sm underline text-muted-foreground"
        >
          Sign out
        </Link>
      </div>

      <form action={saveProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" defaultValue={me.firstName ?? ""} />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" defaultValue={me.lastName ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" defaultValue={me.role ?? ""} />
          </div>
          <div>
            <Label htmlFor="gradYear">Grad year</Label>
            <Input id="gradYear" name="gradYear" defaultValue={me.gradYear ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="industries">Industry (comma separated)</Label>
            <Input id="industries" name="industries" placeholder="Tech, Finance, Public Sector" defaultValue={defaultIndustries} />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" defaultValue={me.company ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expertise">Expertise you can offer (comma separated)</Label>
            <Input id="expertise" name="expertise" placeholder="Resume Review, Networking, Interview Prep" defaultValue={defaultExpertise} />
          </div>
          <div className="flex items-end gap-2">
            <input id="contactPermission" name="contactPermission" type="checkbox" defaultChecked={!!me.contactPermission} />
            <Label htmlFor="contactPermission">I’m happy to be contacted to help</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={me.location ?? ""} />
        </div>

        <div>
          <Label htmlFor="priorExperience">Prior experience</Label>
          <textarea id="priorExperience" name="priorExperience" className="w-full rounded-md border p-2 min-h-[80px]" defaultValue={me.priorExperience ?? ""} />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <textarea id="bio" name="bio" className="w-full rounded-md border p-2 min-h-[100px]" defaultValue={me.bio ?? ""} />
        </div>

        <div>
          <Label htmlFor="teamAffiliation">Team affiliation</Label>
          <Input id="teamAffiliation" name="teamAffiliation" placeholder="Team Alum" defaultValue={me.teamAffiliation ?? ""} />
        </div>

        <div className="pt-2">
          <button type="submit" className="border rounded-xl px-4 py-2 hover:bg-muted">
            Save changes
          </button>
        </div>
      </form>
    </main>
  );
}
