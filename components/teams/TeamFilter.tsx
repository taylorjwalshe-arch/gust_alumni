"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Option = { label: string; value: string };

const OPTIONS: Option[] = [
  { label: "All teams", value: "" },
  { label: "Georgetown Sailing", value: "georgetown-sailing" },
];

export default function TeamFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [value, setValue] = useState<string>("");

  const current = useMemo(() => sp.get("team") || "", [sp]);

  useEffect(() => {
    setValue(current);
  }, [current]);

  function onChange(next: string) {
    const params = new URLSearchParams(sp.toString());
    if (next) params.set("team", next);
    else params.delete("team");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="fixed z-40 bottom-4 left-4">
      <label className="text-xs block mb-1 text-gray-600">Team</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
      >
        {OPTIONS.map((o) => (
          <option key={o.value || "all"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
