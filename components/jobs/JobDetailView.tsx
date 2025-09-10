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
  description: string | null;
};

type JobDetailResponse = {
  item: NormalizedJob | null;
};

function timeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return d === 1 ? "1 day ago" : `${d} days ago`;
  if (h > 0) return h === 1 ? "1 hour ago" : `${h} hours ago`;
  if (m > 0) return m === 1 ? "1 minute ago" : `${m} minutes ago`;
  return "just now";
}

function asCompanyNode(text: string | null) {
  if (!text) return <span className="text-gray-700">Unknown company</span>;
  const t = text.trim();
  const looksUrl = /^https?:\/\//i.test(t);
  if (looksUrl) {
    return (
      <a href={t} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
        {t}
      </a>
    );
  }
  return <span className="text-gray-700">{t}</span>;
}

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
  const ago = timeAgo(d.postedAt);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{d.title ?? "Untitled"}</h1>
          <p className="mt-1">{asCompanyNode(d.company)}</p>
        </div>
        {d.isRequest ? (
          <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Request
          </span>
        ) : null}
      </div>

      {d.location ? <p className="text-sm text-gray-600">{d.location}</p> : null}
      {ago ? <p className="text-xs text-gray-400">Posted {ago}</p> : null}

      {d.description ? (
        <div className="prose max-w-none whitespace-pre-wrap text-sm text-gray-800">{d.description}</div>
      ) : (
        <div className="text-sm text-gray-500">No description provided.</div>
      )}

      <div>
        <button
          type="button"
          className="rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => {}}
        >
          Contact poster
        </button>
      </div>
    </div>
  );
}
