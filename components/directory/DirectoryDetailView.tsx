'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Person = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  location: string | null;
};

function toPerson(input: unknown): Person | null {
  const r = (input as Record<string, unknown>) || {};
  const idRaw = r.id;
  const firstName = typeof r.firstName === 'string' ? r.firstName : null;
  const lastName = typeof r.lastName === 'string' ? r.lastName : null;
  const industries = Array.isArray(r.industries) ? (r.industries as string[]) : null;
  const location = typeof r.location === 'string' ? (r.location as string) : null;

  if (typeof idRaw === 'string' || typeof idRaw === 'number') {
    return {
      id: String(idRaw),
      firstName,
      lastName,
      industries,
      location,
    };
  }
  return null;
}

export default function DirectoryDetailView() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? '');
  const router = useRouter();

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/directory/${id}`, { cache: 'no-store' });
        const json = await res.json();
        const candidate =
          toPerson((json && (json.item as unknown)) ?? json) ?? null;
        if (!cancelled) setPerson(candidate);
      } catch {
        if (!cancelled) setPerson(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (!person) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <button
          onClick={() => router.push('/directory')}
          style={{
            width: 'fit-content',
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          ← Back to Directory
        </button>
        <div>Not found.</div>
      </div>
    );
  }

  const name =
    [person.firstName, person.lastName].filter(Boolean).join(' ').trim() || 'Unnamed';

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <button
        onClick={() => router.push('/directory')}
        style={{
          width: 'fit-content',
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          background: 'white',
          cursor: 'pointer',
        }}
      >
        ← Back to Directory
      </button>

      <div style={{ fontSize: 22, fontWeight: 700 }}>{name}</div>

      {Array.isArray(person.industries) && person.industries.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {person.industries.map((t, i) => (
            <span
              key={`ind-${i}`}
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {person.location && (
        <div style={{ color: '#6b7280' }}>{person.location}</div>
      )}
    </div>
  );
}
