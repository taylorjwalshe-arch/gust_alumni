"use client";

import Link from "next/link";
import { useMemo } from "react";

export type DirectoryListItem = {
  id: string | number;
  firstName: string | null;
  lastName: string | null;
};

function initials(firstName: string | null, lastName: string | null) {
  const a = (firstName || "").trim();
  const b = (lastName || "").trim();
  const i1 = a ? a[0] : "";
  const i2 = b ? b[0] : "";
  const val = `${i1}${i2}`.toUpperCase();
  return val || "??";
}

export default function DirectoryCard({ item }: { item: DirectoryListItem }) {
  const name = useMemo(() => {
    const fn = item.firstName ?? "";
    const ln = item.lastName ?? "";
    const full = `${fn} ${ln}`.trim();
    return full || "Unknown Person";
  }, [item.firstName, item.lastName]);

  const mono = initials(item.firstName, item.lastName);
  const href = `/directory/${encodeURIComponent(String(item.id))}`;

  return (
    <Link href={href} className="group rounded-2xl border border-gray-200 hover:border-blue-300 transition-colors p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 ring-1 ring-gray-200">{mono}</div>
      <div className="flex-1">
        <div className="font-medium group-hover:text-blue-700">{name}</div>
        <div className="text-xs text-gray-500">View profile</div>
      </div>
      <div aria-hidden className="text-gray-300 group-hover:text-blue-400 transition-colors">→</div>
    </Link>
  );
}
