// components/mentors/MentorsView.tsx
'use client';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { MentorCard, type MentorListItem } from './MentorCard';

type MentorsResponse = {
  items: MentorListItem[];
  total: number;
  page: number;
  pageSize: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<MentorsResponse>);

export default function MentorsView() {
  // 1) Data hook (always called)
  const { data, isLoading, error } = useSWR<MentorsResponse>('/api/mentors?pageSize=200', fetcher);

  // 2) Local state hooks (always called)
  const [q, setQ] = useState('');
  const [industriesSel, setIndustriesSel] = useState<string[]>([]);
  const [expertiseSel, setExpertiseSel] = useState<string[]>([]);

  // 3) Derivations with useMemo (always called)
  const items: MentorListItem[] = useMemo(() => (data?.items ?? []) as MentorListItem[], [data]);

  const { allIndustries, allExpertise } = useMemo(() => {
    const ind = new Set<string>();
    const exp = new Set<string>();
    const list = (data?.items ?? []) as MentorListItem[];
    for (const m of list) {
      (m.industries ?? []).forEach((x) => x && ind.add(x));
      (m.expertise ?? []).forEach((x) => x && exp.add(x));
    }
    return {
      allIndustries: Array.from(ind).sort(),
      allExpertise: Array.from(exp).sort(),
    };
  }, [data]);

  const visible = useMemo(() => {
    const qLower = q.toLowerCase();
    return items.filter((m) => {
      const name = `${m.firstName ?? ''} ${m.lastName ?? ''}`.toLowerCase();
      const qOk = !qLower || name.includes(qLower);
      const indOk =
        industriesSel.length === 0 ||
        (m.industries ?? []).some((x) => industriesSel.includes(x));
      const expOk =
        expertiseSel.length === 0 ||
        (m.expertise ?? []).some((x) => expertiseSel.includes(x));
      return qOk && indOk && expOk;
    });
  }, [items, q, industriesSel, expertiseSel]);

  // 4) Now we can early-return (after all hooks have run)
  if (error) return <div className="p-6 text-red-600">Failed to load mentors.</div>;
  if (isLoading || !data) return <div className="p-6">Loading mentors…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mentors</h1>
      <div className="text-sm text-gray-500">{visible.length} of {items.length} mentors</div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name…"
          className="w-64 rounded-xl border px-3 py-2 text-sm"
        />

        {/* Industry filter */}
        <details className="relative">
          <summary className="cursor-pointer select-none rounded-xl border px-3 py-2 text-sm bg-white">
            Industry {industriesSel.length ? `(${industriesSel.length})` : ''}
          </summary>
          <div className="absolute z-10 mt-2 w-64 max-h-64 overflow-auto rounded-xl border bg-white p-2 shadow">
            {allIndustries.length === 0 ? (
              <div className="p-2 text-xs text-gray-500">No industry data.</div>
            ) : (
              allIndustries.map((opt) => (
                <label key={opt} className="flex items-center gap-2 px-2 py-1 text-sm">
                  <input
                    type="checkbox"
                    checked={industriesSel.includes(opt)}
                    onChange={(e) => {
                      setIndustriesSel((prev) =>
                        e.target.checked ? [...prev, opt] : prev.filter((x) => x !== opt)
                      );
                    }}
                  />
                  {opt}
                </label>
              ))
            )}
          </div>
        </details>

        {/* Expertise filter */}
        <details className="relative">
          <summary className="cursor-pointer select-none rounded-xl border px-3 py-2 text-sm bg-white">
            Expertise {expertiseSel.length ? `(${expertiseSel.length})` : ''}
          </summary>
          <div className="absolute z-10 mt-2 w-64 max-h-64 overflow-auto rounded-xl border bg-white p-2 shadow">
            {allExpertise.length === 0 ? (
              <div className="p-2 text-xs text-gray-500">No expertise data.</div>
            ) : (
              allExpertise.map((opt) => (
                <label key={opt} className="flex items-center gap-2 px-2 py-1 text-sm">
                  <input
                    type="checkbox"
                    checked={expertiseSel.includes(opt)}
                    onChange={(e) => {
                      setExpertiseSel((prev) =>
                        e.target.checked ? [...prev, opt] : prev.filter((x) => x !== opt)
                      );
                    }}
                  />
                  {opt}
                </label>
              ))
            )}
          </div>
        </details>

        {(industriesSel.length > 0 || expertiseSel.length > 0 || q) && (
          <button
            className="rounded-xl border px-3 py-2 text-sm bg-white"
            onClick={() => { setQ(''); setIndustriesSel([]); setExpertiseSel([]); }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="text-gray-500">No matches. Adjust filters or search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((m) => (
            <MentorCard key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}
