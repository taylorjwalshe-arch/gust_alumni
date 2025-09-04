'use client';

import { useEffect, useMemo, useState } from 'react';
import DirectoryCard from './DirectoryCard';

type Person = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  location: string | null;
};

type ApiResponse = {
  items: Person[];
  total: number;
  page: number;
  pageSize: number;
};

export default function DirectoryView() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<ApiResponse>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 0,
  });
  const [loading, setLoading] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    p.set('pageSize', '100');
    return p.toString();
  }, [q]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/directory?${qs}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const json = await res.json();
        setData({
          items: Array.isArray(json?.items) ? json.items : [],
          total: Number.isFinite(json?.total) ? json.total : 0,
          page: Number.isFinite(json?.page) ? json.page : 1,
          pageSize: Number.isFinite(json?.pageSize) ? json.pageSize : 0,
        });
      } catch {
        setData({ items: [], total: 0, page: 1, pageSize: 0 });
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [qs]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name..."
          aria-label="Search directory by name"
          style={{
            width: '100%',
            maxWidth: 440,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
        />
        <div style={{ color: '#6b7280', minWidth: 80, textAlign: 'right' }}>
          {data.items.length} of {data.total}
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : data.items.length === 0 ? (
        <div>No matches.</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 12,
          }}
        >
          {data.items.map((p) => (
            <DirectoryCard
              key={p.id}
              id={p.id}
              firstName={p.firstName}
              lastName={p.lastName}
              industries={p.industries}
              location={p.location}
            />
          ))}
        </div>
      )}
    </div>
  );
}
