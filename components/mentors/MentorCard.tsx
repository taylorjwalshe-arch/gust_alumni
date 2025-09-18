import type { Person } from "@prisma/client";

export default function MentorCard({ person }: { person: Person }) {
  return (
    <div className="rounded border p-4 shadow-sm hover:shadow-md transition">
      <h2 className="text-lg font-semibold">
        {person.firstName} {person.lastName}
      </h2>
      <p className="text-sm text-gray-600">{person.company}</p>
      <p className="text-sm text-gray-500">{person.location}</p>
    </div>
  );
}
