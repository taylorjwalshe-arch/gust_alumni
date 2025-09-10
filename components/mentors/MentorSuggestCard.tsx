"use client";
import React from "react";
import Link from "next/link";

type Candidate = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries: string[] | null;
  location: string | null;
};

type SuggestResponse = {
  item: Candidate | null;
  weekStartISO: string;
};

export default function MentorSuggestCard() {
  const [data, setData] = React.useState<SuggestResponse>({ item: null, weekStartISO: "" });
  const [loading, setLoading] = React.useState(false);
  const [action, setAction] = React.useState<"idle" | "accepted" | "skipped" | "contacted">("idle");

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch("/api/mentors/suggest", { cache: "no-store" });
        const json: SuggestResponse = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ item: null, weekStartISO: "" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  async function log(action: "accept" | "skip" | "contact") {
    if (!data.item) return;
    try {
      await fetch("/api/mentors/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId: data.item.id, action }),
      });
      if (action === "accept") setAction("accepted");
      if (action === "skip") setAction("skipped");
      if (action === "contact") setAction("contacted");
    } catch {}
  }

  if (loading) return <div className="text-sm text-gray-500">Loading weekly suggestion…</div>;
  if (!data.item) return <div className="text-sm text-gray-500">No mentor suggestion this week.</div>;

  const m = data.item;
  const name = `${(m.firstName ?? "").trim()} ${(m.lastName ?? "").trim()}`.trim() || "Unnamed mentor";

  return (
    <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your weekly mentor match</h2>
        <span className="text-xs text-blue-700">Week of {new Date(data.weekStartISO).toLocaleDateString()}</span>
      </div>
      <div className="space-y-1">
        <Link href={`/mentors/${m.id}`} className="text-blue-700 hover:underline">{name}</Link>
        {m.location ? <div className="text-sm text-gray-600">{m.location}</div> : null}
        {Array.isArray(m.industries) && m.industries.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {m.industries.slice(0, 4).map((tag, i) => (
              <span key={i} className="rounded-full bg-white px-2 py-0.5 text-xs text-blue-700 ring-1 ring-blue-200">{tag}</span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="rounded-2xl bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={() => log("accept")}
          disabled={action !== "idle"}
        >
          Accept
        </button>
        <button
          type="button"
          className="rounded-2xl border border-blue-300 px-3 py-1.5 text-sm text-blue-700 hover:bg-white/70 disabled:opacity-50"
          onClick={() => log("skip")}
          disabled={action !== "idle"}
        >
          Skip
        </button>
        <button
          type="button"
          className="ml-auto rounded-2xl bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-black disabled:opacity-50"
          onClick={() => log("contact")}
          disabled={action !== "idle"}
        >
          Contact
        </button>
      </div>
      {action !== "idle" ? (
        <div className="mt-2 text-xs text-gray-600">
          {action === "accepted" ? "Saved: accepted." : action === "skipped" ? "Saved: skipped." : "Saved: contacted."}
        </div>
      ) : null}
    </div>
  );
}
