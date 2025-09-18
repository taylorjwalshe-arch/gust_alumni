import { db } from "@/lib/db";
import MentorsView from "@/components/mentors/MentorsView";

export default async function TeamMentorsPage({ params }: { params: { slug: string } }) {
  const mentors = await db.person.findMany({
    where: { role: "MENTOR", teamAffiliation: params.slug },
    orderBy: { lastName: "asc" },
  });

  return (
    <section>
      <h1 className="text-2xl font-bold capitalize mb-4">Mentors — {params.slug}</h1>
      <MentorsView people={mentors} />
    </section>
  );
}
