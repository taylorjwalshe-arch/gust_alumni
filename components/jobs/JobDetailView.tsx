"use client";
import React from "react";
import { useParams } from "next/navigation";

type NormalizedJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
};

type JobDetailResponse = {
  item: NormalizedJob | null;
};

export default function JobDetailView() {
  const params = useParams() as Record<string, string | string[]>;
  const raw = params?.id;
  const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const [data, setData] = React.useState<JobDetailResponse>({ item: null });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${encodeURIComponent(id)}`, { cache: "no-store" });
        const json: JobDetailResponse = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ item: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (!data.item) return <div className="text-sm text-gray-500">Job not found.</div>;

  const d = data.item;
  const dateLabel = d.postedAt ? new Date(d.postedAt).toLocaleDateString() : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{d.title ?? "Untitled"}</h1>
          <p className="text-gray-700">{d.company ?? "Unknown company"}</p>
        </div>
        {d.isRequest ? (
          <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Request
          </span>
        ) : null}
      </div>
      {d.location ? <p className="text-sm text-gray-600">{d.location}</p> : null}
      {dateLabel ? <p className="text-xs text-gray-400">Posted {dateLabel}</p> : null}
    </div>
  );
}
