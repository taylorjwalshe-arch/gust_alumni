// components/directory/DirectoryView.tsx
'use client';
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { DirectoryCard, type DirectoryListItem } from './DirectoryCard';

type DirectoryResponse = { items: Array<Pick<DirectoryListItem, "id" | "firstName" | "lastName">>; total: number; page: number; pageSize: number; };
const fetcher = (u: string) => fetch(u).then(r => r.json() as Promise<DirectoryResponse>);

export default function DirectoryView() {
  const { data, isLoading, error } = useSWR<DirectoryResponse>('/api/directory?pageSize=500', fetcher);
  const [q, setQ] = useState('');

  const list = useMemo(() => data?.items ?? [], [data]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(p => (`${p.firstName ?? ''} ${p.lastName ?? ''}`).toLowerCase().includes(needle));
  }, [list, q]);

  if (error) return <div className="p-6 text-red-600">Failed to load directory.</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Directory</h1>
      <div className="text-sm text-gray-500">{filtered.length} of {list.length}</div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name…"
        className="w-64 rounded-xl border px-3 py-2 text-sm"
        aria-label="Search directory"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl border border-gray-200 p-4">
              <div className="h-full w-full animate-pulse bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No matches.</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <DirectoryCard item={{ id: String(p.id), firstName: p.firstName ?? null, lastName: p.lastName ?? null }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
