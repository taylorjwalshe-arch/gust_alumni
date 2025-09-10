"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";

export default function TeamTabs() {
  const pathname = usePathname();
  const params = useParams();
  const raw = params?.slug;
  const slug = Array.isArray(raw) ? (raw[0] ?? "") : typeof raw === "string" ? raw : "";

  const tabs = [
    { href: `/teams/${slug}/directory`, label: "Directory" },
    { href: `/teams/${slug}/jobs`, label: "Jobs" },
    { href: `/teams/${slug}/feed`, label: "Feed" },
  ];

  return (
    <div className="flex gap-4 border-b pb-2 mb-4">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-1 rounded-t-lg ${active ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-50"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
