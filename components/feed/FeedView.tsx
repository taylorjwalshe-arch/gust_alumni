"use client";
import React from "react";
import FeedItemCard from "./FeedItemCard";

type FeedJob = {
  id: string;
  type: "job";
  title: string | null;
  company: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
};

type FeedPerson = {
  id: string;
  type: "person";
  name: string | null;
  postedAt: string | null;
};

type FeedMentor = {
  id: string;
  type: "mentor";
  name: string | null;
  postedAt: string | null;
};

type FeedItem = FeedJob | FeedPerson | FeedMentor;

type FeedResponse = {
  items: FeedItem[];
  total: number;
  page: number;
  pageSize: number;
};

export default function FeedView() {
  const [data, setData] = React.useState<FeedResponse>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch("/api/feed?pageSize=20", { cache: "no-store" });
        const json: FeedResponse = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ items: [], total: 0, page: 1, pageSize: 20 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (data.items.length === 0) return <div className="text-sm text-gray-500">Nothing yet.</div>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {data.items.map((it) => (
        <FeedItemCard key={`${it.type}-${it.id}`} item={it} />
      ))}
    </div>
  );
}
