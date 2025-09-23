import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DirectoryPage() {
  const people = await prisma.person.findMany();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Directory</h1>
      <ul className="list-disc pl-5">
        {people.map((p) => (
          <li key={p.id}>
            <Link href={`/directory/${p.id}`}>
              {p.firstName} {p.lastName} ({p.company ?? "—"})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
