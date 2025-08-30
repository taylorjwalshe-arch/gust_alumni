// components/directory/DirectoryView.tsx
'use client';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

type DirectoryItem = { id: string; firstName: string | null; lastName: string | null };
type DirectoryResponse = { items: DirectoryItem[]; total: number; page: number; pageSize: number };

const fetcher = (u: string) => fetch(u).then((r) => r.json() as Promise<DirectoryResponse>);

export default function DirectoryView() {
  const [q, setQ] = useState('');
  const { data, isLoading, error } = useSWR<DirectoryResponse>('/api/directory?pageSize=500', fetcher);

  const items = useMemo(() => data?.items ?? [], [data]);
  const visible = useMemo(() => {
    const s = q.toLowerCase();
    if (!s) return items;
    return items.filter((p) => (`${p.firstName ?? ''} ${p.lastName ?? ''}`).toLowerCase().includes(s));
  }, [items, q]);

  if (error) return <div className="p-6 text-red-600">Failed to load directory.</div>;
  if (isLoading || !data) return <div className="p-6">Loading directory…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Directory</h1>
      <div className="text-sm text-gray-500">{visible.length} of {items.length}</div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name…"
        className="w-64 rounded-xl border px-3 py-2 text-sm"
      />

      {visible.length === 0 ? (
        <div className="text-gray-500">No matches.</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {visible.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white/5 p-4 border border-gray-200">
              {`${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Unnamed'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
