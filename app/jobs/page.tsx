"use client";
import useSWR from "swr";
import Link from "next/link";

type Job = {
  id: string;
  title: string | null;
  company: string | null;
};

async function fetcher(url: string): Promise<Job[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export default function JobsPage() {
  const { data, error, isLoading } = useSWR<Job[]>("/api/jobs", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Failed to load</div>;
  if (data.length === 0) return <div>No jobs yet.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Jobs</h1>
      <ul className="mt-4 space-y-2">
        {data.map((job: Job) => (
          <li key={job.id}>
            <Link
              href={`/jobs/${job.id}`}
              className="text-blue-600 hover:underline"
            >
              {job.title ?? "Untitled"} – {job.company ?? "Unknown"}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
