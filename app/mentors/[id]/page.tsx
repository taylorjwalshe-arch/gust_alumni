import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function MentorDetailPage({ params }: { params: { id: string } }) {
  const person = await db.person.findUnique({ where: { id: params.id } });

  if (!person) return notFound();

  return (
    <section>
      <h1 className="text-2xl font-bold mb-2">
        {person.firstName} {person.lastName}
      </h1>
      <p className="text-gray-600 text-sm">{person.location}</p>
      <p className="text-gray-500 text-sm">{person.company}</p>

      <div className="mt-6 prose">
        {person.bio ? <p>{person.bio}</p> : <p>No bio available.</p>}
      </div>
    </section>
  );
}
