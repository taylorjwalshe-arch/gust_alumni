import Link from "next/link";
import { people } from "@/data/people";

type Params = { id: string };

interface Props {
  params: Promise<Params>;
}

export default async function ProfileDetailPage({ params }: Props) {
  const { id } = await params;
  const person = people.find((p) => p.id === id);

  if (!person) {
    return (
      <main className="p-10">
        <p className="mb-4">Profile not found.</p>
        <Link href="/directory" className="text-blue-600 underline">
          ← Back to Directory
        </Link>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-10 max-w-3xl mx-auto">
      <Link href="/directory" className="text-blue-600 underline">
        ← Back to Directory
      </Link>
      <section className="space-y-1">
        <h1 className="text-3xl font-bold">
          {person.firstName} {person.lastName}
        </h1>
        <div className="text-sm text-muted-foreground">
          {person.role.toUpperCase()} · {person.gradYear ?? "—"}
        </div>
      </section>

      <section className="space-y-1 text-sm">
        <div>
          {person.industry ?? "—"} @ {person.company ?? "—"}
        </div>
        <div>{person.location ?? "—"}</div>
        {person.email && (
          <div>
            <a href={`mailto:${person.email}`} className="text-blue-600 underline">
              {person.email}
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
