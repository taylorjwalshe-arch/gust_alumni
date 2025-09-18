"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Job = {
  id: string;
  title: string | null;
  company: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
};

type Resp = {
  items: Job[];
  total: number;
  page: number;
  pageSize: number;
};

export default function PersonJobsList() {
  const params = useParams() as Record<string, string | string[]>;
  const raw = params?.id;
  const personId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const [data, setData] = React.useState<Resp>({ items: [], total: 0, page: 1, pageSize: 100 });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!personId) return;
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/by-poster/${encodeURIComponent(personId)}`, {
          cache: "no-store",
        });
        const json: Resp = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ items: [], total: 0, page: 1, pageSize: 100 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [personId]);

  if (loading) return null;
  if (!data.items.length) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">Recent postings</h2>
      <ul className="space-y-2">
        {data.items.slice(0, 5).map((j) => (
          <li key={j.id} className="text-sm">
            <Link href={`/jobs/${j.id}`} className="text-blue-600 hover:underline">
              {j.title ?? "Untitled"}
            </Link>
            {j.company ? <span className="text-gray-600"> • {j.company}</span> : null}
            {j.isRequest ? (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                Request
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
