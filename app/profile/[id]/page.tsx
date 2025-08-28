import { people } from "@/data/people";

interface Props {
  params: { id: string };
}

export default function ProfileDetailPage({ params }: Props) {
  const person = people.find((p) => p.id === params.id);

  if (!person) {
    return <main className="p-10">Profile not found.</main>;
  }

  return (
    <main className="space-y-4 p-10">
      <h1 className="text-2xl font-bold">
        {person.firstName} {person.lastName}
      </h1>
      <div className="text-sm text-muted-foreground">
        {person.role.toUpperCase()} · {person.gradYear ?? "—"}
      </div>
      <div className="text-sm">
        {person.industry ?? "—"} @ {person.company ?? "—"}
      </div>
      <div className="text-sm">{person.location ?? "—"}</div>
      {person.email && (
        <div className="text-sm">
          <a href={`mailto:${person.email}`} className="text-blue-600 underline">
            {person.email}
          </a>
        </div>
      )}
    </main>
  );
}
