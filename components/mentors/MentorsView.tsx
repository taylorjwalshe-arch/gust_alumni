import type { Person } from "@prisma/client";
import MentorCard from "./MentorCard";

export default function MentorsView({ people }: { people: Person[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {people.map((p) => (
        <MentorCard key={p.id} person={p} />
      ))}
    </div>
  );
}
