"use client";
import useSWR from "swr";
import Link from "next/link";

type Mentor = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company?: string | null;
};

async function fetcher(url: string): Promise<Mentor[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export default function MentorsPage() {
  const { data, error, isLoading } = useSWR<Mentor[]>("/api/mentors", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Failed to load</div>;
  if (data.length === 0) return <div>No mentors yet.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mentors</h1>
      <ul className="list-disc pl-5">
        {data.map((m: Mentor) => (
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
