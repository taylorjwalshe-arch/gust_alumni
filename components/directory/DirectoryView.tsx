import DirectoryFilters from "./DirectoryFilters";

"use client";
import React from "react";
import DirectoryCard from "./DirectoryCard";

type PersonItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  location: string | null;
};

type DirectoryResponse = {
  items: PersonItem[];
  total: number;
  page: number;
  pageSize: number;
};

type Count = { key: string; count: number };

function sanitizeIndustry(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
}

function sanitizeLocation(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export default function DirectoryView() {
  const [q, setQ] = React.useState("");
  const [data, setData] = React.useState<DirectoryResponse>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 100,
  });
  const [loading, setLoading] = React.useState(false);

  const [industryFilter, setIndustryFilter] = React.useState<string>("all");
  const [locFilter, setLocFilter] = React.useState<string>("");

  const fetchData = React.useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("pageSize", "200");
      if (query.trim()) params.set("q", query.trim());
      const usp = new URLSearchParams();
if (q) usp.set("q", q);
if (typeof window !== "undefined") {
  const current = new URLSearchParams(window.location.search);
  if (current.get("industry")) usp.set("industry", current.get("industry")!);
  if (current.get("location")) usp.set("location", current.get("location")!);
}
const res = await fetch(`/api/directory?${usp.toString()}`, { cache: "no-store" });

      const json: DirectoryResponse = await res.json();
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

  const allIndustries = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of data.items) {
      for (const tag of sanitizeIndustry(row.industries)) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    const arr: Count[] = Array.from(counts.entries()).map(([key, count]) => ({ key, count }));
    arr.sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
    return arr;
  }, [data.items]);

  const topLocations = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of data.items) {
      const loc = sanitizeLocation(row.location);
      if (!loc) continue;
      counts.set(loc, (counts.get(loc) ?? 0) + 1);
    }
    const arr: Count[] = Array.from(counts.entries()).map(([key, count]) => ({ key, count }));
    arr.sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
    return arr.slice(0, 8);
  }, [data.items]);

  const filtered = React.useMemo(() => {
    let rows = data.items.slice();
    if (industryFilter !== "all") {
      rows = rows.filter((r) => sanitizeIndustry(r.industries).includes(industryFilter));
    }
    if (locFilter.trim()) {
      const lq = locFilter.trim().toLowerCase();
      rows = rows.filter((r) => sanitizeLocation(r.location).toLowerCase().includes(lq));
    }
    return rows;
  }, [data.items, industryFilter, locFilter]);

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
            placeholder="Search name"
            className="w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-sm text-gray-600 whitespace-nowrap">{countLabel}</div>
        </div>
      </div>

     <DirectoryFilters />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIndustryFilter("all")}
            className={`rounded-full border px-3 py-1 text-sm ${industryFilter === "all" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700"}`}
          >
            All industries
          </button>
          {allIndustries.slice(0, 10).map((it) => (
            <button
              key={it.key}
              onClick={() => setIndustryFilter(industryFilter === it.key ? "all" : it.key)}
              className={`rounded-full border px-3 py-1 text-sm ${industryFilter === it.key ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700"}`}
              title={`${it.count}`}
            >
              {it.key} · {it.count}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
            placeholder="Filter by location"
            className="rounded-2xl border border-gray-300 px-3 py-2 text-sm"
          />
          {topLocations.map((it) => (
            <button
              key={it.key}
              onClick={() => setLocFilter(it.key)}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
              title={`${it.count}`}
            >
              {it.key} · {it.count}
            </button>
          ))}
          {(industryFilter !== "all" || locFilter.trim()) ? (
            <button
              onClick={() => { setIndustryFilter("all"); setLocFilter(""); }}
              className="ml-2 rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-500">No people found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <DirectoryCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
