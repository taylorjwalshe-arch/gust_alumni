"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function DirectoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const industries = ["A&D", "Energy", "Software", "Nuclear", "Sensors", "Industrial Tech"];
  const locations = ["Boston, MA", "Providence, RI", "Remote", "NYC", "DC"];

  const selectedIndustry = params.get("industry") || "";
  const selectedLocation = params.get("location") || "";

  function updateParam(key: string, value: string) {
    const newParams = new URLSearchParams(Array.from(params.entries()));
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  }

  return (
    <div className="flex gap-4 flex-wrap">
      <select
        value={selectedIndustry}
        onChange={(e) => updateParam("industry", e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All Industries</option>
        {industries.map((i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
{(selectedIndustry || selectedLocation) && (
  <button
    onClick={() => {
      updateParam("industry", "");
      updateParam("location", "");
    }}
    className="text-sm text-blue-600 underline"
  >
    Clear Filters
  </button>
)}

      <select
        value={selectedLocation}
        onChange={(e) => updateParam("location", e.target.value)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All Locations</option>
        {locations.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
{(selectedIndustry || selectedLocation) && (
  <button
    onClick={() => {
      updateParam("industry", "");
      updateParam("location", "");
    }}
    className="text-sm text-blue-600 underline"
  >
    Clear Filters
  </button>
)}

    </div>
  );
}
