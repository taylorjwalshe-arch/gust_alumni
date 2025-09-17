"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import TeamTabs from "@/components/teams/TeamTabs";

export default function TeamHubPage() {
  const params = useParams();
  const raw = params?.slug;
  const slug = Array.isArray(raw) ? (raw[0] ?? "") : typeof raw === "string" ? raw : "";

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Team: {slug || "(unknown)"}</h1>
      <TeamTabs />
      <nav className="flex gap-4 text-blue-600 underline">
        <Link href={`/directory?team=${encodeURIComponent(slug)}`}>Directory</Link>
        <Link href={`/jobs?team=${encodeURIComponent(slug)}`}>Jobs</Link>
        <Link href={`/feed?team=${encodeURIComponent(slug)}`}>Feed</Link>
      </nav>
    </div>
  );
}
