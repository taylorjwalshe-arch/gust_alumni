// components/mentors/MentorDetailView.tsx
'use client';
import useSWR from 'swr';

type Mentor = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  industry: string | null;
  location: string | null;
  imageUrl: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<Mentor>);

export default function MentorDetailView({ id }: { id: string }) {
  const { data, isLoading, error } = useSWR<Mentor>(`/api/mentors/${id}`, fetcher);

  if (error) return <div className="p-6 text-red-600">Failed to load mentor.</div>;
  if (isLoading || !data) return <div className="p-6">Loading…</div>;

  const name = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Unnamed';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start gap-6">
        <img
          src={data.imageUrl || '/avatar-placeholder.png'}
          alt={name}
          className="h-24 w-24 rounded-full object-cover bg-gray-100"
        />
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          <p className="text-gray-600">{data.headline ?? '—'}</p>
          <div className="flex gap-2 flex-wrap mt-2 text-xs text-gray-500">
            {data.industry && <span className="px-2 py-0.5 rounded-full border">{data.industry}</span>}
            {data.location && <span className="px-2 py-0.5 rounded-full border">{data.location}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
