// components/mentors/MentorsView.tsx
'use client';
import useSWR from 'swr';

type MentorListItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  industry: string | null;
  location: string | null;
  imageUrl: string | null;
};

type MentorsResponse = {
  items: MentorListItem[];
  total: number;
  page: number;
  pageSize: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<MentorsResponse>);

export default function MentorsView() {
  const { data, isLoading, error } = useSWR<MentorsResponse>('/api/mentors?page=1&pageSize=24', fetcher);

  if (error) return <div className="p-6 text-red-600">Failed to load mentors.</div>;
  if (isLoading || !data) return <div className="p-6">Loading mentors…</div>;

  const items = data.items ?? [];
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mentors</h1>
      <div className="text-sm text-muted-foreground">{data.total} mentors</div>
      <ul className="list-disc pl-6">
        {items.map((m) => (
          <li key={m.id}>
            {(m.firstName ?? '') + ' ' + (m.lastName ?? '')} — {m.headline ?? 'No headline'}
          </li>
        ))}
      </ul>
    </div>
  );
}
