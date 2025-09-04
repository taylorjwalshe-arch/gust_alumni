"use client";

import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

type ApiPerson = {
  id: string | number | null;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  expertise: string[] | null;
  location: string | null;
  imageUrl: string | null;
};

const fetcher = async (url: string): Promise<ApiPerson> => {
  try {
    const r = await fetch(url);
    if (!r.ok) return { id: null, firstName: null, lastName: null, industries: null, expertise: null, location: null, imageUrl: null };
    return await r.json();
  } catch {
    return { id: null, firstName: null, lastName: null, industries: null, expertise: null, location: null, imageUrl: null };
  }
};

function initials(firstName: string | null, lastName: string | null) {
  const a = (firstName || "").trim();
  const b = (lastName || "").trim();
  const i1 = a ? a[0] : "";
  const i2 = b ? b[0] : "";
  const val = `${i1}${i2}`.toUpperCase();
  return val || "??";
}

export default function DirectoryDetailView() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data, isLoading } = useSWR<ApiPerson>(id ? `/api/directory/${id}` : null, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const name = useMemo(() => {
    const fn = data?.firstName ?? "";
    const ln = data?.lastName ?? "";
    const full = `${fn} ${ln}`.trim();
    return full || "Unknown Person";
  }, [data?.firstName, data?.lastName]);

  if (!id) {
    return (
      <div className="p-6">
        <Link href="/directory" className="text-blue-600 hover:underline">← Back to Directory</Link>
        <div className="mt-6 text-sm text-gray-600">Invalid person ID.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-64 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const person = data as ApiPerson | undefined;
  const showNotFound = !person || (person.id === null && person.firstName === null && person.lastName === null);

  if (showNotFound) {
    return (
      <div className="p-6">
        <Link href="/directory" className="text-blue-600 hover:underline">← Back to Directory</Link>
        <h1 className="mt-6 text-xl font-semibold">Person not found</h1>
        <p className="mt-2 text-sm text-gray-600">We couldn’t find a record for this ID. It may have been removed.</p>
      </div>
    );
  }

  const avatar = person?.imageUrl;
  const mono = initials(person?.firstName ?? null, person?.lastName ?? null);

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/directory" className="text-blue-600 hover:underline">← Back to Directory</Link>

      <div className="mt-6 flex items-center gap-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-gray-100 ring-2 ring-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600">{mono}</div>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          {person?.location ? (
            <p className="text-sm text-gray-600">{person.location}</p>
          ) : (
            <p className="text-sm text-gray-400">Location not provided</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 p-4">
          <h2 className="font-medium mb-2">Industries</h2>
          {person?.industries?.length ? (
            <ul className="flex flex-wrap gap-2">
              {person.industries.map((ind) => (
                <li key={ind} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">{ind}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No industries listed.</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 p-4">
          <h2 className="font-medium mb-2">Expertise</h2>
          {person?.expertise?.length ? (
            <ul className="flex flex-wrap gap-2">
              {person.expertise.map((skill) => (
                <li key={skill} className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">{skill}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No expertise listed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
