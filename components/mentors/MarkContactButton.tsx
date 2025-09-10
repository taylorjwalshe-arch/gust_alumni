"use client";

import { useState } from "react";

export default function MarkContactButton({ mentorId }: { mentorId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function mark() {
    setLoading(true);
    try {
      const res = await fetch("/api/mentors/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, action: "contacted" }),
      });
      const json = await res.json();
      if (json && json.ok) {
        setDone(true);
        try {
          window.location.reload();
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) return <span className="text-green-600 text-sm">Logged</span>;

  return (
    <button
      onClick={mark}
      disabled={loading}
      className="rounded-lg bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700 disabled:opacity-50"
      type="button"
    >
      {loading ? "Saving..." : "I contacted them"}
    </button>
  );
}
