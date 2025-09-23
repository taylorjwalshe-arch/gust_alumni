import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MentorsPage() {
  const mentors = await prisma.person.findMany({
    where: { role: "Mentor" },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Mentors</h1>
      <ul className="list-disc pl-5">
        {mentors.map((m) => (
          <li key={m.id}>
            <Link href={`/mentors/${m.id}`}>
              {m.firstName} {m.lastName} ({m.company ?? "—"})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
