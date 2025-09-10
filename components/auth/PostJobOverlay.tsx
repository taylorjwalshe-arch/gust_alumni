"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Session = { user?: Record<string, unknown> | null } | null;

export default function PostJobOverlay() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!cancelled) {
          if (res.ok) {
            const json = (await res.json()) as unknown as Session;
            setAuthed(!!(json && json.user));
          } else {
            setAuthed(false);
          }
        }
      } catch {
        if (!cancelled) setAuthed(false);
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!checked) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {authed ? (
        <Link
          href="/jobs/new"
          className="rounded-2xl bg-blue-600 text-white px-4 py-2 shadow-lg hover:bg-blue-700 transition"
        >
          Post a job
        </Link>
      ) : (
        <Link
          href={`/api/auth/signin?callbackUrl=${encodeURIComponent("/jobs/new")}`}
          className="rounded-2xl border border-gray-300 bg-white text-gray-800 px-4 py-2 shadow hover:bg-gray-50 transition"
        >
          Sign in to post
        </Link>
      )}
    </div>
  );
}
