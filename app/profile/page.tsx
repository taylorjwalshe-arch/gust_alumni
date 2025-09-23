import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function ProfilePage() {
  const person = await prisma.person.findFirst().catch(() => null);

  if (!person) {
    return <div>No profile found.</div>;
  }

  redirect(`/profile/${person.id}`);
}
