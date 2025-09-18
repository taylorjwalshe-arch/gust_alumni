"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Job = {
  id: string;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  isRequest?: boolean | null;
};
type ListOut = { items: Job[]; total: number; page: number; pageSize: number };

export default function JobsIndexClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const q = sp.get("q") || "";
  const type = sp.get("type") || "";
  const location = sp.get("location") || "";
  const sort = sp.get("sort") || "newest";
  const page = Number(sp.get("page") || "1");
  const team = sp.get("team") || "";

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    if (location) p.set("location", location);
    if (sort) p.set("sort", sort);
    if (page) p.set("page", String(page));
    if (team) p.set("team", team);
    return p.toString();
  }, [q, type, location, sort, page, team]);

  const [data, setData] = useState<ListOut>({ items: [], total: 0, page: 1, pageSize: 20 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/jobs?${query}`, { cache: "no-store" });
        const json = (await res.json()) as ListOut;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ items: [], total: 0, page: 1, pageSize: 20 });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  function goNew() {
    router.push("/jobs/new");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white"
          onClick={goNew}
          aria-label="Post a job"
        >
          Post a job
        </button>
      </div>
      <div className="grid gap-3">
        {data.items.map((j) => (
          <a
            key={j.id}
            href={`/jobs/${encodeURIComponent(j.id)}`}
            className="border rounded p-3 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">{j.title || "(untitled)"}</div>
              {j.isRequest ? (
                <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                  Request
                </span>
              ) : null}
            </div>
            <div className="text-sm text-gray-600">
              {[j.company, j.location].filter(Boolean).join(" • ")}
            </div>
          </a>
        ))}
        {data.items.length === 0 && <div className="text-sm text-gray-600">No jobs yet.</div>}
      </div>
    </div>
  );
}
