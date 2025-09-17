"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/components/notify/NotificationsProvider";

type Session =
  | {
      user?: {
        role?: string | null;
      } | null;
    }
  | null;

export default function NewSocialForm() {
  const { notify } = useNotifications();
  const [role, setRole] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("Social");
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (res.ok) {
          const json = (await res.json()) as unknown as Session;
          const r = (json && json.user && typeof json.user.role === "string") ? json.user.role : null;
          if (!cancelled) setRole(r);
        } else if (!cancelled) {
          setRole(null);
        }
      } catch {
        if (!cancelled) setRole(null);
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!checked || role !== "admin") return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setOk(null);
    setErr(null);
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, type }),
      });
      const json = await res.json();
      if (json && json.ok) {
        setOk(true);
        notify("Social post published");
        setTitle("");
        setBody("");
        setType("Social");
        try {
          window.location.reload();
        } catch {}
      } else {
        setOk(false);
        setErr((json && json.reason) || "Failed to post");
      }
    } catch {
      setOk(false);
      setErr("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="border rounded-2xl p-4 shadow-sm bg-white space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">New social post</h2>
        {ok === true && <span className="text-green-600 text-sm">Posted</span>}
        {ok === false && <span className="text-red-600 text-sm">Error{err ? `: ${err}` : ""}</span>}
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-gray-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded-lg px-3 py-2"
          placeholder="e.g., Georgetown places 2nd at Nationals"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-gray-700">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="border rounded-lg px-3 py-2"
          rows={3}
          placeholder="Optional details…"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-gray-700">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-lg px-3 py-2">
          <option>Social</option>
          <option>Team News</option>
          <option>Alum News</option>
          <option>Personal</option>
          <option>Event</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
