import DirectoryClient from "@/components/directory-client";
import { prisma } from "@/lib/db";

// do not cache; always read from the bundled SQLite file at runtime
export const revalidate = 0;

export default async function DirectoryPage() {
  const people = await prisma.person.findMany();
  return <DirectoryClient initialPeople={people} />;
}
