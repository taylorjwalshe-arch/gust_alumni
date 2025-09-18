"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import DirectoryCard from "./DirectoryCard";

type Person = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  location?: string | null;
  industries?: string[] | null;
};

export default function DirectoryView() {
  const { data, error } = useSWR("/api/directory", (url) =>
    fetch(url).then((res) => res.json())
  );

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");

  const people: Person[] = data?.items || [];

  const filtered = useMemo(() => {
    return people.filter((p) => {
      const matchesSearch =
        `${p.firstName ?? ""} ${p.lastName ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesLocation = location
        ? (p.location ?? "").toLowerCase() === location.toLowerCase()
        : true;

      const matchesIndustry = industry
        ? p.industries?.includes(industry)
        : true;

      return matchesSearch && matchesLocation && matchesIndustry;
    });
  }, [people, search, location, industry]);

  const locations = Array.from(
    new Set(
      people
        .map((p) => p.location)
        .filter((x): x is string => typeof x === "string")
    )
  ).sort();

  const industries = Array.from(
    new Set(
      people
        .flatMap((p) => p.industries || [])
        .filter((x): x is string => typeof x === "string")
    )
  ).sort();

  if (error) return <div>Error loading directory.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search by name"
          className="border px-3 py-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-4">
          <select
            className="border px-2 py-1 rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            className="border px-2 py-1 rounded"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">All industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          {(search || location || industry) && (
            <button
              className="text-sm underline text-gray-600"
              onClick={() => {
                setSearch("");
                setLocation("");
                setIndustry("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Showing {filtered.length} of {people.length}
      </div>

      {filtered.length === 0 ? (
        <div>No matches found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((person) => (
            <DirectoryCard key={person.id} {...person} />
          ))}
        </div>
      )}
    </div>
  );
}
