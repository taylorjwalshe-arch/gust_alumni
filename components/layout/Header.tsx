"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import TeamSwitcherClient from "./TeamSwitcherClient";

type Me = { authed: boolean; email?: string | null; role?: string | null };

export default function Header() {
  const [me, setMe] = useState<Me>({ authed: false });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const json = (await res.json()) as Me;
        if (!cancelled) setMe(json);
      } catch {
        if (!cancelled) setMe({ authed: false });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 shadow-md bg-white">
      <Link href="/" className="font-bold text-lg">
        Alumni Connect
      </Link>
      <div className="flex items-center gap-4">
        <Suspense fallback={<span className="text-sm text-gray-500">Loading…</span>}>
          <TeamSwitcherClient />
        </Suspense>
        {me.authed ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">{me.email || ""}</span>
            {me.role ? (
              <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">{me.role}</span>
            ) : null}
            <Link href="/api/auth/signout" className="text-blue-600 text-sm">
              Sign out
            </Link>
          </div>
        ) : (
          <Link href="/api/auth/signin" className="text-blue-600 text-sm">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
