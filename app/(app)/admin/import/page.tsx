"use client";

import { useMemo, useState } from "react";

type Summary = {
  ok: boolean;
  created: number;
  updated: number;
  skipped: number;
  total: number;
  reason?: string | null;
  sample?: Array<Record<string, string>>;
};

function splitCSVLine(line: string): string[] {
  const res: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        q = !q;
      }
    } else if (ch === "," && !q) {
      res.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  res.push(cur);
  return res;
}

function parseCSV(raw: string): Array<Record<string, string>> {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = splitCSVLine(lines[0]).map((h) => h.trim());
  const out: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) {
      row[header[c] || `col${c}`] = String(cols[c] ?? "").trim();
    }
    out.push(row);
  }
  return out;
}

export default function AdminImportPage() {
  const [csv, setCsv] = useState<string>("");
  const [res, setRes] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Array<Record<string, string>>>([]);
  const [didPreview, setDidPreview] = useState(false);

  const headers = useMemo(() => {
    const set = new Set<string>();
    for (const r of parsed) Object.keys(r).forEach((k) => set.add(k));
    return Array.from(set);
  }, [parsed]);

  async function runImport() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/import/people", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: csv,
      });
      const json = await r.json();
      setRes(json as Summary);
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  function onPreview() {
    const rows = parseCSV(csv);
    setParsed(rows);
    setDidPreview(true);
  }

  const template = "firstName,lastName,email,location,industries,teamSlug\nAlex,Rivera,alex.rivera@example.com,Washington DC,Tech|Product,georgetown-sailing";

  const summaryBanner = res ? (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <div className="font-semibold mb-2">Import summary</div>
      <div className="text-sm">Created: {res.created} • Updated: {res.updated} • Skipped: {res.skipped} • Total: {res.total}</div>
      {res.reason && <div className="text-sm text-amber-700 mt-1">Reason: {res.reason}</div>}
    </div>
  ) : null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Import People (CSV)</h1>
      <p className="text-sm text-gray-600">Columns: firstName,lastName,email,location,industries,teamSlug</p>

      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
            onClick={() => setCsv(template)}
            type="button"
          >
            Load template
          </button>
          <button
            className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
            onClick={onPreview}
            type="button"
          >
            Parse preview
          </button>
        </div>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={12}
          className="w-full border rounded-xl p-3 font-mono text-xs"
          placeholder={template}
        />
      </div>

      {didPreview && (
        <div className="rounded-xl border p-4 bg-white shadow-sm space-y-3">
          <div className="font-semibold">Preview</div>
          {parsed.length === 0 ? (
            <div className="text-sm text-gray-500">No rows parsed.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="text-left p-2 border-b">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 25).map((r, i) => (
                    <tr key={i}>
                      {headers.map((h) => (
                        <td key={h} className="p-2 border-b whitespace-pre-wrap">{r[h] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.length > 25 && (
                <div className="text-xs text-gray-500 mt-1">Showing first 25 of {parsed.length} rows</div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={runImport}
        disabled={busy || csv.trim().length === 0}
        className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "Importing..." : "Import"}
      </button>

      {err && <div className="text-red-600 text-sm">{err}</div>}
      {summaryBanner}

      {res?.sample && res.sample.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm">Sample parsed rows (from server)</summary>
          <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(res.sample, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
