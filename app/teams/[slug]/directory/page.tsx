import { db } from "@/lib/db";

export default async function TeamDirectoryPage({ params }: { params: { slug: string } }) {
  const people = await db.person.findMany({
    where: {
      teamAffiliation: params.slug,
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <section>
      <h1 className="text-2xl font-bold capitalize mb-4">Directory — {params.slug}</h1>

      {people.length === 0 ? (
        <p className="text-gray-500">No one found for this team.</p>
      ) : (
        <ul className="grid gap-4">
          {people.map((person) => (
            <li key={person.id} className="border p-4 rounded shadow-sm">
              <h2 className="font-semibold">
                {person.firstName} {person.lastName}
              </h2>
              <p className="text-sm text-gray-600">{person.company}</p>
              <p className="text-sm text-gray-500">{person.location}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
