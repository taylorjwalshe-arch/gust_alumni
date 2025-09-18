"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Item = { id: string; type: string; title: string; body?: string | null; postedAt: string };
type ListOut = { items: Item[]; total: number; page: number; pageSize: number };

export default function FeedClient() {
  const sp = useSearchParams();
  const team = sp.get("team") || "";
  const page = Number(sp.get("page") || "1");
  const pageSize = Number(sp.get("pageSize") || "20");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (team) p.set("team", team);
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    return p.toString();
  }, [team, page, pageSize]);

  const [data, setData] = useState<ListOut>({ items: [], total: 0, page: 1, pageSize: 20 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/feed?${query}`, { cache: "no-store" });
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
      <h1 className="text-2xl font-bold text-center">Feed</h1>
      <div className="grid gap-3">
        {data.items.map((it) => (
          <div key={it.id} className="border rounded p-3">
            <div className="text-xs uppercase text-gray-500">{it.type}</div>
            <div className="font-semibold">{it.title}</div>
            {it.body ? (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{it.body}</div>
            ) : null}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(it.postedAt).toLocaleString()}
            </div>
          </div>
        ))}
        {data.items.length === 0 && <div className="text-sm text-gray-600">No items yet.</div>}
      </div>
    </div>
  );
}
