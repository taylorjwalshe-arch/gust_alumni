"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function TeamSwitcherClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [team, setTeam] = useState<string>("");

  useEffect(() => {
    setTeam(sp.get("team") || "");
  }, [sp]);

  const label = useMemo(() => {
    if (!team) return "All teams";
    if (team === "georgetown-sailing") return "Georgetown Sailing";
    return team;
  }, [team]);

  function updateTeam(val: string) {
    const url = new URL(window.location.href);
    if (val) url.searchParams.set("team", val);
    else url.searchParams.delete("team");
    router.push(url.pathname + url.search);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={team}
        onChange={(e) => {
          const val = e.target.value;
          setTeam(val);
          updateTeam(val);
        }}
        className="border rounded-md px-2 py-1"
        aria-label="Select team"
      >
        <option value="">All teams</option>
        <option value="georgetown-sailing">Georgetown Sailing</option>
      </select>
      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{label}</span>
    </div>
  );
}
