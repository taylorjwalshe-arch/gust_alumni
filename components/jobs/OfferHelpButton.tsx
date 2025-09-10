"use client";

import { useState } from "react";
import { useNotify } from "@/components/notify/NotificationsProvider";

export default function OfferHelpButton({ jobId }: { jobId: string }) {
  const { notify } = useNotify();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "I can help with this request." }),
      });
      const json = await res.json();
      if (json.ok) {
        setSent(true);
        notify("Thanks for offering help — the requester will be notified.");
      } else {
        setError(json.reason || "Failed to send");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (sent) return <p className="text-green-600" role="status">Thanks! The requester will be notified.</p>;
  if (error) return <p className="text-red-600" role="alert">Error: {error}</p>;

  return (
    <button
      onClick={send}
      disabled={loading}
      aria-label="Offer help to this job request"
      className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Sending..." : "Offer help"}
    </button>
  );
}
