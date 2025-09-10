"use client";

import { useSearchParams } from "next/navigation";

export default function ClaimBanner() {
  const sp = useSearchParams();
  const id = sp.get("id") || "";
  if (!id) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
      <div className="rounded-xl bg-amber-100 text-amber-900 px-4 py-2 shadow">
        Claiming profile <span className="font-semibold">#{id}</span>. Submit to link this account.
      </div>
    </div>
  );
}
