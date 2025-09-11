"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";

type Row = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  location?: string | null;
  industries?: string | null;
  teamSlug?: string | null;
};

function parseCSV(text: string): Row[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    header.forEach((h, idx) => {
      row[h] = cols[idx] || "";
    });
    rows.push({
      firstName: row.firstName || null,
      lastName: row.lastName || null,
      email: row.email || null,
      location: row.location || null,
      industries: row.industries || null,
      teamSlug: row.teamSlug || null,
    });
  }
  return rows;
}

export default function ImportClient() {
  const search = useSearchParams();
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<Row[]>([]);
  const [status, setStatus] = useState<"idle" | "parsing" | "ready" | "importing" | "done" | "error">("idle");
  const team = search.get("team") || "";

  const count = useMemo(() => preview.length, [preview]);

  function onParse() {
    setStatus("parsing");
    try {
      const rows = parseCSV(csv);
      setPreview(rows);
      setStatus("ready");
    } catch {
      setPreview([]);
      setStatus("error");
    }
  }

  async function onImport() {
    setStatus("importing");
    try {
      const res = await fetch("/api/admin/import/people", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: csv,
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Import</h1>
      {team ? <div className="text-sm text-gray-600">Team scoped: {team}</div> : null}
      <textarea
        className="w-full h-48 border rounded p-2 font-mono text-sm"
        placeholder="firstName,lastName,email,location,industries,teamSlug"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        aria-label="CSV input"
      />
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded bg-gray-200" onClick={onParse} aria-label="Parse preview">
          Parse preview
        </button>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
          onClick={onImport}
          disabled={count === 0}
          aria-label="Import"
        >
          Import {count > 0 ? `(${count})` : ""}
        </button>
        {status !== "idle" && (
          <span className="text-sm text-gray-600" role="status">
            {status}
          </span>
        )}
      </div>
      {count > 0 && (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">firstName</th>
                <th className="p-2 text-left">lastName</th>
                <th className="p-2 text-left">email</th>
                <th className="p-2 text-left">location</th>
                <th className="p-2 text-left">industries</th>
                <th className="p-2 text-left">teamSlug</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2">{r.firstName}</td>
                  <td className="p-2">{r.lastName}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">{r.location}</td>
                  <td className="p-2">{r.industries}</td>
                  <td className="p-2">{r.teamSlug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
