import { people } from "@/data/people";

export default function DirectoryPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Team Directory</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people.map(p => (
          <li key={p.id} className="border rounded-xl p-4">
            <div className="font-semibold">{p.firstName} {p.lastName}</div>
            <div className="text-sm text-muted-foreground">
              {p.role.toUpperCase()} · {p.gradYear ?? "—"}
            </div>
            <div className="text-sm">{p.industry ?? "—"} @ {p.company ?? "—"}</div>
            <div className="text-sm">{p.location ?? "—"}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
