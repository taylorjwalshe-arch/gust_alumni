import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  // For now, just grab the first person in the database
  const person = await prisma.person.findFirst();

  if (!person) {
    return <div className="p-6">No profile found.</div>;
  }

  // Redirect to their profile detail page
  redirect(`/profile/${person.id}`);
}
