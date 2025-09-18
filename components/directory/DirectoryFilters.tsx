"use client";

import { useSearchParams, useRouter } from "next/navigation";

export function DirectoryFilters({
  active,
}: {
  active?: { industry?: string; location?: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRemove = (key: "industry" | "location") => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete(key);
    router.push(`/directory?${newParams.toString()}`);
  };

  if (!active?.industry && !active?.location) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {active.industry && (
        <button
          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
          onClick={() => handleRemove("industry")}
        >
          {active.industry} ✕
        </button>
      )}
      {active.location && (
        <button
          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
          onClick={() => handleRemove("location")}
        >
          {active.location} ✕
        </button>
      )}
    </div>
  );
}
