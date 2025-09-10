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

type TypeFilter = "all" | "jobs" | "requests";
type SortKey = "newest" | "oldest";

export default function JobsView() {
  const [q, setQ] = React.useState("");
  const [data, setData] = React.useState<JobsResponse>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 100,
  });
  const [loading, setLoading] = React.useState(false);

  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [locFilter, setLocFilter] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("newest");

  const fetchData = React.useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("pageSize", "100");
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/jobs?${params.toString()}`, { cache: "no-store" });
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

  const filtered = React.useMemo(() => {
    let rows = data.items.slice();

    if (typeFilter === "jobs") {
      rows = rows.filter((r) => r.isRequest !== true);
    } else if (typeFilter === "requests") {
      rows = rows.filter((r) => r.isRequest === true);
    }

    if (locFilter.trim()) {
      const lq = locFilter.trim().toLowerCase();
      rows = rows.filter((r) => (r.location ?? "").toLowerCase().includes(lq));
    }

    rows.sort((a, b) => {
      const ad = a.postedAt ? new Date(a.postedAt).getTime() : 0;
      const bd = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      return sortKey === "newest" ? bd - ad : ad - bd;
    });

    return rows;
  }, [data.items, typeFilter, locFilter, sortKey]);

  const countLabel =
    filtered.length === 0 && data.total === 0 ? "0 of 0" : `${filtered.length} of ${data.total}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or company"
            className="w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-sm text-gray-600 whitespace-nowrap">{countLabel}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="rounded-2xl border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="jobs">Jobs</option>
            <option value="requests">Requests</option>
          </select>

          <input
            type="text"
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
            placeholder="Filter by location"
            className="rounded-2xl border border-gray-300 px-3 py-2 text-sm"
          />

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-2xl border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-500">No jobs yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} {...job} />
          ))}
        </div>
      )}
    </div>
  );
}
