"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Person = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  location: string | null;
  industries: string[] | null;
  teamSlug?: string | null;
  why?: string | null;
};

type SuggestOut = { ok?: boolean; suggestion?: Person | null; reason?: string | null };
type MatchesOut = { ok?: boolean; items: Person[]; total: number; page: number; pageSize: number; reason?: string | null };

export default function MentorsClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [team, setTeam] = useState(sp.get("team") || "georgetown-sailing");
  const [industry, setIndustry] = useState(sp.get("industry") || "");

  const [suggestion, setSuggestion] = useState<Person | null>(null);
  const [list, setList] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const qs = useMemo(() => {
    const params = new URLSearchParams();
    if (team) params.set("team", team);
    if (industry) params.set("industry", industry);
    return params.toString();
  }, [team, industry]);

  useEffect(() => {
    const url = qs ? `/mentors?${qs}` : "/mentors";
    router.replace(url);
  }, [qs, router]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const sugRes = await fetch(`/api/mentors/suggest?${qs}`, { cache: "no-store" });
        const sugJson = (await sugRes.json()) as SuggestOut;
        if (!cancelled) setSuggestion(sugJson?.suggestion ?? null);

        const listRes = await fetch(`/api/mentors/matches?${qs}`, { cache: "no-store" });
        const listJson = (await listRes.json()) as MatchesOut;
        if (!cancelled) setList(Array.isArray(listJson?.items) ? listJson.items : []);
      } catch {
        if (!cancelled) setErr("Failed to load mentor data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [qs]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mentor Matches</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Team</label>
          <select className="w-full border rounded p-2" value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">All teams</option>
            <option value="georgetown-sailing">Georgetown Sailing</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Industry (keyword)</label>
          <input className="w-full border rounded p-2" placeholder="e.g., finance, software, consulting" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="text-sm text-gray-600">Loading…</div> : null}
      {err ? <div role="alert" className="text-sm text-red-600">{err}</div> : null}

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Weekly suggestion</h2>
        {suggestion ? (
          <div className="border rounded-xl p-4 shadow-sm">
            <div className="font-medium">{[suggestion.firstName, suggestion.lastName].filter(Boolean).join(" ") || "Unknown"}</div>
            <div className="text-sm text-gray-600">{suggestion.industries?.join(", ") || "—"} · {suggestion.location || "—"}</div>
            {suggestion.why ? <div className="text-sm mt-1"><span className="font-semibold">Why this match:</span> {suggestion.why}</div> : null}
          </div>
        ) : (
          <div className="text-sm text-gray-600">No suggestion available for these filters.</div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">More matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.length === 0 ? <div className="text-sm text-gray-600">No matches found.</div> : null}
          {list.map((p) => (
            <div key={p.id} className="border rounded-xl p-4 shadow-sm">
              <div className="font-medium">{[p.firstName, p.lastName].filter(Boolean).join(" ") || "Unknown"}</div>
              <div className="text-sm text-gray-600">{p.industries?.join(", ") || "—"} · {p.location || "—"}</div>
              {p.why ? <div className="text-sm mt-1"><span className="font-semibold">Why:</span> {p.why}</div> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
