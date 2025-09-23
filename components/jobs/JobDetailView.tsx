"use client";
import useSWR from "swr";

type Job = {
  id: string;
  title: string | null;
  company: string | null;
  location?: string | null;
  isRequest?: boolean | null;
  description?: string | null;
  postedAt?: string | null;
};

async function fetcher(url: string): Promise<Job | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export default function JobDetailView({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR<Job | null>(
    id ? `/api/jobs/${id}` : null,
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Not found</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{data.title ?? "Untitled Job"}</h1>
      {data.company && <p className="text-lg">{data.company}</p>}
      {data.location && <p className="text-gray-600">{data.location}</p>}
      {data.isRequest && (
        <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
          Request
        </span>
      )}
      {data.description && <p>{data.description}</p>}
      {data.postedAt && (
        <p className="text-sm text-gray-500">
          Posted {new Date(data.postedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
