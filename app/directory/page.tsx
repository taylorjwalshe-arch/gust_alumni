import { db } from "@/lib/db";
import DirectoryView from "@/components/directory/DirectoryView";

export default async function DirectoryPage() {
  const people = await db.person.findMany({ orderBy: { lastName: "asc" } });

  return (
    <section>
      <h1 className="text-xl font-semibold mb-4">Directory</h1>
      <DirectoryView people={people} />
    </section>
  );
}
