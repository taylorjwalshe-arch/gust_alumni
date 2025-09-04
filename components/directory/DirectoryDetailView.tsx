// components/directory/DirectoryDetailView.tsx
'use client';
import useSWR from 'swr';
import Link from 'next/link';

type DirectoryDetail = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  expertise: string[] | null;
  location: string | null;
  imageUrl: string | null;
};

const fetcher = (u: string) => fetch(u).then(r => r.json() as Promise<DirectoryDetail>);

export default function DirectoryDetailView({ id }: { id: string }) {
  const { data, isLoading, error } = useSWR<DirectoryDetail>(`/api/directory/${id}`, fetcher);

  if (error) return <div className="p-6 text-red-600">Failed to load profile.</div>;
  if (isLoading || !data) return <div className="p-6">Loading…</div>;

  const name = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Unnamed';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={name} className="h-16 w-16 rounded-full object-cover bg-gray-100" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600">
            {(data.firstName?.[0] ?? '') + (data.lastName?.[0] ?? '')}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          <div className="text-sm text-gray-500">{data.location ?? 'Location not provided'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-2xl border p-4">
          <h2 className="font-medium mb-2">Industries</h2>
          {data.industries?.length ? (
            <ul className="flex flex-wrap gap-2">
              {data.industries.map((x) => (
                <li key={x} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">{x}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No industries listed.</div>
          )}
        </section>

        <section className="rounded-2xl border p-4">
          <h2 className="font-medium mb-2">Expertise</h2>
          {data.expertise?.length ? (
            <ul className="flex flex-wrap gap-2">
              {data.expertise.map((x) => (
                <li key={x} className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">{x}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No expertise listed.</div>
          )}
        </section>
      </div>

      <div>
        <Link href="/directory" className="text-blue-600 underline">← Back to directory</Link>
      </div>
    </div>
  );
}
