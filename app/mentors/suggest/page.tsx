import { db } from "@/lib/db";
import MentorsView from "@/components/mentors/MentorsView";

export default async function MentorSuggestionsPage() {
  const people = await db.person.findMany({
    where: {
      role: "MENTOR",
      location: "Boston",
    },
    take: 4,
    orderBy: { lastName: "asc" },
  });

  return (
    <section>
      <h1 className="text-xl font-semibold mb-4">Suggested Mentors</h1>
      <MentorsView people={people} />
    </section>
  );
}
