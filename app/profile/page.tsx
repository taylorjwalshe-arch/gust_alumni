import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export const revalidate = 0;

function parseCSV(v: string): string[] {
  return v.split(",").map(s => s.trim()).filter(Boolean);
}

// server action
async function updateProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const firstName = (formData.get("firstName") || "").toString().trim();
  const lastName  = (formData.get("lastName")  || "").toString().trim();
  const role      = (formData.get("role")      || "alumni").toString();
  const gradYearV = formData.get("gradYear"); const gradYear = gradYearV ? Number(gradYearV) : null;

  const industries = parseCSV((formData.get("industries") || "").toString());
  const expertise  = parseCSV((formData.get("expertise")  || "").toString());

  const company         = (formData.get("company")         || "").toString().trim() || null;
  const location        = (formData.get("location")        || "").toString().trim() || null;
  const priorExperience = (formData.get("priorExperience") || "").toString().trim() || null;
  const bio             = (formData.get("bio")             || "").toString().trim() || null;
  const teamAffiliation = (formData.get("teamAffiliation") || "").toString().trim() || null;
  const contactPermission = formData.get("contactPermission") === "on";

  await prisma.person.upsert({
    where: { userId: session.user.id },
    update: {
      firstName, lastName, role, gradYear,
      industries, company, location,
      priorExperience, expertise,
      contactPermission, bio, teamAffiliation,
      email: session.user.email ?? undefined,
    },
    create: {
      userId: session.user.id,
      email: session.user.email ?? null,
      firstName: firstName || (session.user.name?.split(" ")[0] ?? "First"),
      lastName: lastName || (session.user.name?.split(" ").slice(1).join(" ") || "Last"),
      role, gradYear,
      industries, company, location,
      priorExperience, expertise,
      contactPermission, bio, teamAffiliation,
    },
  });

  redirect("/profile");
}

export default async function MyProfilePage() {
  const session = await auth();

  if (!session) {
    return (
      <main className="max-w-3xl mx-auto p-10 space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Please sign in to edit your profile.</p>
        <form action={async () => { "use server"; await signIn("github"); }}>
          <button className="border rounded-xl px-4 py-2 hover:bg-muted">Sign in with GitHub</button>
        </form>
      </main>
    );
  }

  const me = await prisma.person.findFirst({ where: { userId: session.user.id } });
  const defaultIndustries = Array.isArray(me?.industries) ? (me!.industries as string[]).join(", ") : "";
  const defaultExpertise  = Array.isArray(me?.expertise)  ? (me!.expertise  as string[]).join(", ") : "";

  return (
    <main className="max-w-3xl mx-auto p-10 space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <form action={updateProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" defaultValue={me?.firstName ?? session.user.name?.split(" ")[0] ?? ""} />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" defaultValue={me?.lastName ?? session.user.name?.split(" ").slice(1).join(" ") ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={me?.role ?? "alumni"}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gradYear">Graduation year</Label>
            <Input id="gradYear" name="gradYear" type="number" defaultValue={me?.gradYear ?? ""} />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={me?.location ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="industries">Industry (comma separated)</Label>
            <Input id="industries" name="industries" placeholder="Tech, Finance, Public Sector" defaultValue={defaultIndustries} />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" defaultValue={me?.company ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expertise">Expertise you can offer (comma separated)</Label>
            <Input id="expertise" name="expertise" placeholder="Resume Review, Networking, Interview Prep" defaultValue={defaultExpertise} />
          </div>
          <div className="flex items-end gap-2">
            <input id="contactPermission" name="contactPermission" type="checkbox" defaultChecked={!!me?.contactPermission} />
            <Label htmlFor="contactPermission">I’m happy to be contacted to help</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="priorExperience">Prior experience</Label>
          <textarea id="priorExperience" name="priorExperience" className="w-full rounded-md border p-2 min-h-[80px]" defaultValue={me?.priorExperience ?? ""} />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <textarea id="bio" name="bio" className="w-full rounded-md border p-2 min-h-[100px]" defaultValue={me?.bio ?? ""} />
        </div>

        <div>
          <Label htmlFor="teamAffiliation">Team affiliation</Label>
          <Input id="teamAffiliation" name="teamAffiliation" placeholder="Team Alum" defaultValue={me?.teamAffiliation ?? ""} />
        </div>

        <div className="pt-2">
          <button type="submit" className="border rounded-xl px-4 py-2 hover:bg-muted">Save changes</button>
        </div>
      </form>
    </main>
  );
}
