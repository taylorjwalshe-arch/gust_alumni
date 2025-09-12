"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { authed: boolean; email?: string | null; role?: string | null };
type SaveOut = { ok?: boolean; id?: string | number | null; reason?: string | null };

export default function ProfileClient() {
  const router = useRouter();
  const [me, setMe] = useState<Me>({ authed: false });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [industries, setIndustries] = useState("");
  const [teamSlug, setTeamSlug] = useState("georgetown-sailing");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const json = (await res.json()) as Me;
        if (!cancelled) {
          setMe(json);
          if (json.authed && json.email && !email) setEmail(json.email);
        }
      } catch {
        if (!cancelled) setMe({ authed: false });
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const body = {
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        location: location || null,
        industries: industries ? industries.split(",").map(s => s.trim()).filter(Boolean) : [],
        teamSlug: teamSlug || null,
      };
      const res = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = (await res.json()) as SaveOut;
      if (json && json.ok && json.id != null) {
        router.push(`/directory/${encodeURIComponent(String(json.id))}`);
        return;
      }
      setMsg(json?.reason || "Save failed");
    } catch {
      setMsg("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>
      {msg ? <div role="alert" className="text-sm text-red-600">{msg}</div> : null}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">First name</label>
            <input className="w-full border rounded p-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Last name</label>
            <input className="w-full border rounded p-2" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="w-full border rounded p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input className="w-full border rounded p-2" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Industries (comma-separated)</label>
          <input className="w-full border rounded p-2" value={industries} onChange={(e) => setIndustries(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Team</label>
          <select className="w-full border rounded p-2" value={teamSlug} onChange={(e) => setTeamSlug(e.target.value)}>
            <option value="">All teams</option>
            <option value="georgetown-sailing">Georgetown Sailing</option>
          </select>
        </div>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
      </form>
    </div>
  );
}
