// components/mentors/MentorsView.tsx
'use client';
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
  const { data, isLoading, error } = useSWR<MentorsResponse>('/api/mentors?page=1&pageSize=24', fetcher);

  if (error) return <div className="p-6 text-red-600">Failed to load mentors.</div>;
  if (isLoading || !data) return <div className="p-6">Loading mentors…</div>;

  const items = data.items ?? [];
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mentors</h1>
      <div className="text-sm text-gray-500">{data.total} mentors</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((m) => (
          <MentorCard key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}
