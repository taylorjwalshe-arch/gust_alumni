"use client";

import { useEffect, useState } from "react";
import MarkContactButton from "./MarkContactButton";

type Suggestion = { id: string; name: string | null } | null;
type HistoryItem = { id: string; mentorId: string; action: string; note: string | null; ts: string };
type Out = { week: string; suggestion: Suggestion; history: HistoryItem[]; reason?: string };

export default function MatchHistory() {
  const [data, setData] = useState<Out | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/mentors/matches", { cache: "no-store" });
        const json = (await res.json()) as unknown as Out;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ week: "", suggestion: null, history: [] });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sug = data?.suggestion;

  return (
    <div className="space-y-6">
      <div className="border rounded-2xl p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">This week</div>
            <div className="text-lg font-semibold">{data?.week || ""}</div>
          </div>
          {sug && <MarkContactButton mentorId={sug.id} />}
        </div>
        {sug ? (
          <div className="mt-3">
            <div className="text-gray-700">Suggested mentor</div>
            <div className="text-xl">{sug.name || `#${sug.id}`}</div>
          </div>
        ) : (
          <div className="mt-3 text-gray-500 text-sm">No suggestion available.</div>
        )}
      </div>

      <div className="border rounded-2xl p-4 bg-white shadow-sm">
        <div className="text-lg font-semibold mb-2">Past interactions</div>
        {data?.history?.length ? (
          <ul className="divide-y">
            {data!.history.map((h) => (
              <li key={h.id} className="py-2 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">Mentor #{h.mentorId}</div>
                  <div className="text-xs text-gray-500">{new Date(h.ts).toLocaleString()} — {h.action}</div>
                  {h.note && <div className="text-sm mt-1">{h.note}</div>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No interactions logged yet.</div>
        )}
      </div>
    </div>
  );
}
