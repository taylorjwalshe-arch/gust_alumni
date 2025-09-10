"use client";
import React from "react";
import Link from "next/link";

type FeedItem = {
  id: string;
  type: "job";
  title: string | null;
  company: string | null;
  isRequest: boolean | null;
  postedAt: string | null;
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

export default function FeedItemCard({ item }: { item: FeedItem }) {
  const ago = timeAgo(item.postedAt);
  if (item.type === "job") {
    const isReq = item.isRequest === true;
    return (
      <Link href={`/jobs/${item.id}`} className="block rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Job</div>
            <h3 className="text-lg font-semibold">{item.title ?? "Untitled"}</h3>
            <p className="text-sm text-gray-700">
              {isReq ? "Anonymous request" : item.company ?? "Unknown company"}
            </p>
          </div>
          {isReq ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Request
            </span>
          ) : null}
        </div>
        {ago ? <p className="mt-1 text-xs text-gray-400">Posted {ago}</p> : null}
      </Link>
    );
  }
  return null;
}
