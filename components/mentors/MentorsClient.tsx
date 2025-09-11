"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type SuggestOut = {
  week: string;
  suggestion: { id: string; name: string | null } | null;
  history: { mentorId?: string | null; action?: string | null; note?: string | null; ts?: string | null }[];
};

export default function MentorsClient() {
  const _sp = useSearchParams();
  const [data, setData] = useState<SuggestOut>({ week: "", suggestion: null, history: [] });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/mentors/matches", { cache: "no-store" });
        const json = (await res.json()) as SuggestOut;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ week: "", suggestion: null, history: [] });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mentor Matches</h1>
      {data.suggestion ? (
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Week {data.week}</div>
          <div className="font-semibold">{data.suggestion.name || `#${data.suggestion.id}`}</div>
        </div>
      ) : (
        <div className="text-sm text-gray-600">No suggestion yet.</div>
      )}
    </div>
  );
}
