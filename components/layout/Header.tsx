"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { readRole } from "@/lib/session";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [team, setTeam] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("team");
    if (t) setTeam(t);
  }, [searchParams]);

  function handleTeamChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setTeam(val);
    const url = new URL(window.location.href);
    if (val) url.searchParams.set("team", val);
    else url.searchParams.delete("team");
    router.push(url.pathname + url.search);
  }

  const role = readRole(session);
  const authed = !!session;

  return (
    <header className="flex items-center justify-between px-6 py-3 shadow-md bg-white">
      <Link href="/" className="font-bold text-lg">
        Alumni Connect
      </Link>
      <div className="flex items-center gap-4">
        <select
          value={team || ""}
          onChange={handleTeamChange}
          className="border rounded-md px-2 py-1"
          aria-label="Select team"
        >
          <option value="">All teams</option>
          <option value="georgetown-sailing">Georgetown Sailing</option>
        </select>
        {team && (
          <span className="text-sm text-gray-600">Team: {team}</span>
        )}
        {authed ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">{session?.user?.email}</span>
            <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">{role}</span>
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
