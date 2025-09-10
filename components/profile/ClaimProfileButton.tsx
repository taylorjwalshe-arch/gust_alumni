"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Session = { user?: Record<string, unknown> | null } | null;

export default function ClaimProfileButton() {
  const params = useParams();
  const id = useMemo(() => {
    const raw = params?.id;
    if (!raw) return "";
    if (Array.isArray(raw)) return raw[0] ?? "";
    return String(raw);
  }, [params]);

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

  if (!checked || !id) return null;

  const claimHref = `/profile?id=${encodeURIComponent(id)}`;
  const signInHref = `/api/auth/signin?callbackUrl=${encodeURIComponent(claimHref)}`;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {authed ? (
        <Link
          href={claimHref}
          className="rounded-2xl bg-emerald-600 text-white px-4 py-2 shadow-lg hover:bg-emerald-700 transition"
        >
          Claim this profile
        </Link>
      ) : (
        <Link
          href={signInHref}
          className="rounded-2xl border border-gray-300 bg-white text-gray-800 px-4 py-2 shadow hover:bg-gray-50 transition"
        >
          Sign in to claim
        </Link>
      )}
    </div>
  );
}
