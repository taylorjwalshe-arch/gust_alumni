"use client";
import useSWR from "swr";

type Person = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries?: string[] | null;
  location?: string | null;
  imageUrl?: string | null;
};

async function fetcher(url: string): Promise<Person | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export default function DirectoryDetailView({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR<Person | null>(
    id ? `/api/directory/${id}` : null,
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={`${data.firstName ?? ""} ${data.lastName ?? ""}`}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">
            {`${data.firstName?.[0] ?? ""}${data.lastName?.[0] ?? ""}`}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold">
            {data.firstName} {data.lastName}
          </h1>
          {data.location && <p className="text-gray-600">{data.location}</p>}
        </div>
      </div>
      {data.industries && data.industries.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {data.industries.slice(0, 3).map((ind, i) => (
            <span
              key={i}
              className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded"
            >
              {ind}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
