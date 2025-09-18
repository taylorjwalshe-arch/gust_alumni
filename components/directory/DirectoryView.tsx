"use client";

import useSWR from "swr";
import DirectoryCard from "./DirectoryCard";

type Person = {
  id: string;
  firstName: string | null;
  lastName: string | null;
};

export default function DirectoryView() {
  const { data, error } = useSWR("/api/directory", (url) =>
    fetch(url).then((res) => res.json())
  );

  if (error) return <div>Failed to load directory.</div>;
  if (!data) return <div>Loading...</div>;
  if (data.items.length === 0) return <div>No directory entries found.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {data.items.map((person: Person) => (
        <DirectoryCard key={person.id} {...person} />
      ))}
    </div>
  );
}
