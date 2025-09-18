import { db } from "@/lib/db";
import MentorsView from "@/components/mentors/MentorsView";

export default async function MentorsPage() {
  const people = await db.person.findMany({
    where: { role: "MENTOR" },
    orderBy: { lastName: "asc" },
  });

  return (
    <section>
      <h1 className="text-xl font-semibold mb-4">Mentors</h1>
      <MentorsView people={people} />
    </section>
  );
}
