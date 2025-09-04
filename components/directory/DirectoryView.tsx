"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import DirectoryCard, { type DirectoryListItem } from "./DirectoryCard";

type ApiListItem = {
  id: string | number;
  firstName: string | null;
  lastName: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DirectoryView() {
  const { data, isLoading } = useSWR<ApiListItem[]>("/api/directory", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const [query, setQuery] = useState("");

  const list: DirectoryListItem[] = Array.isArray(data) ? data : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const a = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      return a.includes(q);
    });
  }, [list, query]);

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-xl font-semibold">Team Directory</h1>
        <div className="sm:ml-auto w-full sm:w-80">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-200"
            aria-label="Search directory"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl border border-gray-200 p-4">
              <div className="h-full w-full animate-pulse bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-600">
          No people found{query ? ` for “${query}”` : ""}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <DirectoryCard key={`${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
