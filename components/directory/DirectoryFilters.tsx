"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export function DirectoryFilters() {
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

  function clearFilters() {
    const newParams = new URLSearchParams(Array.from(params.entries()));
    newParams.delete("industry");
    newParams.delete("location");
    router.push(`${pathname}?${newParams.toString()}`);
  }

  return (
    <div className="flex gap-4 flex-wrap items-end">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Industry</label>
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
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Location</label>
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
      </div>
      <button
        onClick={clearFilters}
        className="text-sm underline text-blue-600 hover:text-blue-800"
      >
        Clear
      </button>
    </div>
  );
}
