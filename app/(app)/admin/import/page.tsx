"use client";

import { useState } from "react";

type Summary = {
  ok: boolean;
  created: number;
  updated: number;
  skipped: number;
  total: number;
  reason?: string | null;
  sample?: Array<Record<string, string>>;
};

export default function AdminImportPage() {
  const [csv, setCsv] = useState<string>("");
  const [res, setRes] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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

  const template = "firstName,lastName,email,location,industries,teamSlug\nAlex,Rivera,alex.rivera@example.com,Washington DC,Tech|Product,georgetown-sailing";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Import People (CSV)</h1>
      <p className="text-sm text-gray-600">Only admins in Preview/local can run this. Columns: firstName,lastName,email,location,industries,teamSlug</p>

      <div className="space-y-2">
        <button
          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
          onClick={() => setCsv(template)}
          type="button"
        >
          Load template
        </button>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={12}
          className="w-full border rounded-xl p-3 font-mono text-xs"
          placeholder={template}
        />
      </div>

      <button
        onClick={runImport}
        disabled={busy}
        className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "Importing..." : "Import"}
      </button>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      {res && (
        <div className="rounded-xl border p-4">
          <div className="font-semibold mb-2">Result</div>
          <div className="text-sm text-gray-700">ok: {String(res.ok)}</div>
          <div className="text-sm text-gray-700">created: {res.created}</div>
          <div className="text-sm text-gray-700">updated: {res.updated}</div>
          <div className="text-sm text-gray-700">skipped: {res.skipped}</div>
          <div className="text-sm text-gray-700">total: {res.total}</div>
          {res.reason && <div className="text-sm text-amber-700">reason: {res.reason}</div>}
          {Array.isArray(res.sample) && res.sample.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Sample parsed rows</summary>
              <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(res.sample, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
