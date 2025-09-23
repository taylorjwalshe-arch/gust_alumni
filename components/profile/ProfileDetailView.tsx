"use client";
import useSWR from "swr";

type Profile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  location?: string | null;
  imageUrl?: string | null;
};

async function fetcher(url: string): Promise<Profile | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export default function ProfileDetailView({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR<Profile | null>(
    id ? `/api/profile/${id}` : null,
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
          {data.email && <p className="text-gray-600">{data.email}</p>}
        </div>
      </div>
    </div>
  );
}
