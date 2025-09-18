"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Person = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  industries?: string[] | null;
  location?: string | null;
  teamSlug?: string | null;
};
type ListOut = { items: Person[]; total: number; page: number; pageSize: number };

export default function DirectoryIndexClient() {
  const sp = useSearchParams();

  const q = sp.get("q") || "";
  const location = sp.get("location") || "";
  const team = sp.get("team") || "";
  const page = Number(sp.get("page") || "1");
  const pageSize = Number(sp.get("pageSize") || "20");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (location) p.set("location", location);
    if (team) p.set("team", team);
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    return p.toString();
  }, [q, location, team, page, pageSize]);

  const [data, setData] = useState<ListOut>({ items: [], total: 0, page: 1, pageSize: 20 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/directory?${query}`, { cache: "no-store" });
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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Directory</h1>
      <div className="grid gap-3">
        {data.items.map((p) => (
          <a
            key={p.id}
            href={`/directory/${encodeURIComponent(p.id)}`}
            className="border rounded p-3 hover:bg-gray-50"
          >
            <div className="font-semibold">
              {[p.firstName, p.lastName].filter(Boolean).join(" ") || "(unknown)"}
            </div>
            <div className="text-sm text-gray-600">
              {[p.location, (p.industries || []).join("; ")].filter(Boolean).join(" • ")}
            </div>
          </a>
        ))}
        {data.items.length === 0 && <div className="text-sm text-gray-600">No people yet.</div>}
      </div>
    </div>
  );
}
