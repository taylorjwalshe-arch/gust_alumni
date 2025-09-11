"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Contact = {
  jobId?: string | null;
  from?: string | null;
  to?: string | null;
  message?: string | null;
  ts?: string | null;
};

type ListOut = {
  items: Contact[];
  total: number;
  page: number;
  pageSize: number;
  reason?: string | null;
};

export default function ContactsClient() {
  const sp = useSearchParams();
  const page = Number(sp.get("page") || "1");
  const pageSize = Number(sp.get("pageSize") || "20");
  const jobId = sp.get("jobId") || "";
  const from = sp.get("from") || "";
  const to = sp.get("to") || "";

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (page) p.set("page", String(page));
    if (pageSize) p.set("pageSize", String(pageSize));
    if (jobId) p.set("jobId", jobId);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    return p.toString();
  }, [page, pageSize, jobId, from, to]);

  const [data, setData] = useState<ListOut>({ items: [], total: 0, page, pageSize });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/contacts?${query}`, { cache: "no-store" });
        const json = (await res.json()) as ListOut;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ items: [], total: 0, page, pageSize, reason: "fetch-failed" });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [query, page, pageSize]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Contacts</h1>
      <div className="text-sm text-gray-600">
        Showing {data.items.length} of {data.total}
      </div>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">ts</th>
              <th className="p-2 text-left">jobId</th>
              <th className="p-2 text-left">from</th>
              <th className="p-2 text-left">to</th>
              <th className="p-2 text-left">message</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="p-2">{r.ts || ""}</td>
                <td className="p-2">{r.jobId || ""}</td>
                <td className="p-2">{r.from || ""}</td>
                <td className="p-2">{r.to || ""}</td>
                <td className="p-2 whitespace-pre-wrap">{r.message || ""}</td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={5}>
                  {data.reason === "fetch-failed" ? "Failed to load inbox (showing empty list)." : "No contacts yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
