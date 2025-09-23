"use client";
import useSWR from "swr";
import Link from "next/link";

type Person = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company?: string | null;
};

async function fetcher(url: string): Promise<Person[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export default function DirectoryPage() {
  const { data, error, isLoading } = useSWR<Person[]>("/api/directory", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Failed to load</div>;
  if (data.length === 0) return <div>No people yet.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Directory</h1>
      <ul className="list-disc pl-5">
        {data.map((p: Person) => (
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
