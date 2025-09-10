"use client";

import React from "react";
import JobCard from "./JobCard";

type NormalizedJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
};

type JobsResponse = {
  items: NormalizedJob[];
  total: number;
  page: number;
  pageSize: number;
};

export default function JobsView() {
  const [q, setQ] = React.useState("");
  const [data, setData] = React.useState<JobsResponse>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 100,
  });
  const [loading, setLoading] = React.useState(false);

  const fetchData = React.useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("pageSize", "100");
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/jobs?${params.toString()}`, {
        cache: "no-store",
      });
      const json: JobsResponse = await res.json();
      setData(json);
    } catch {
      setData({ items: [], total: 0, page: 1, pageSize: 100 });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData("");
  }, [fetchData]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      fetchData(q);
    }, 300);
    return () => clearTimeout(t);
  }, [q, fetchData]);

  const countLabel =
    data.items.length === 0 && data.total === 0
      ? "0 of 0"
      : `${data.items.length} of ${data.total}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title or company"
          className="w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-sm text-gray-600 whitespace-nowrap">{countLabel}</div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : data.items.length === 0 ? (
        <div className="text-sm text-gray-500">No jobs yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((job) => (
            <JobCard key={job.id} {...job} />
          ))}
        </div>
      )}
    </div>
  );
}
