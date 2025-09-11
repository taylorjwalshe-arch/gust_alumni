"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type Out =
  | { ok: true; item?: { id?: string | number | null } }
  | { ok: false; reason?: string | null };

function idStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "bigint") return String(v);
  return "";
}

export default function ProfileClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const sp = useSearchParams();

  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [industries, setIndustries] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Autofill email from session if available or via ?email=...
  useEffect(() => {
    const fromQuery = sp.get("email") || "";
    const sessionEmail = (session?.user?.email as string | undefined) || "";
    const chosen = fromQuery || sessionEmail;
    if (chosen && !email) setEmail(chosen);
  }, [session, sp, email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          location,
          industries,
        }),
      });
      const json = (await res.json()) as Out & { item?: { id?: unknown } };
      if (json && (json as { ok: unknown }).ok === true) {
        const id = idStr(json.item?.id);
        setToast("Profile saved. Redirecting…");
        // Give users a moment to see the toast, then redirect
        setTimeout(() => {
          if (id) router.push(`/directory/${encodeURIComponent(id)}`);
          else router.push(`/directory`);
        }, 900);
      } else {
        setError((json as { reason?: string | null })?.reason || "save-failed");
      }
    } catch {
      setError("network-failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <form onSubmit={onSubmit} className="space-y-4" aria-label="Profile form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">First name</label>
            <input
              className="w-full border rounded p-2"
              value={firstName}
              onChange={(e) => setFirst(e.target.value)}
              aria-label="First name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last name</label>
            <input
              className="w-full border rounded p-2"
              value={lastName}
              onChange={(e) => setLast(e.target.value)}
              aria-label="Last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="w-full border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
            placeholder="you@example.com"
          />
          {session?.user?.email && (
            <p className="text-xs text-gray-600 mt-1">
              Signed in as {session.user.email}. Click save to claim this email.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            className="w-full border rounded p-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Location"
            placeholder="City, ST"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Industries</label>
          <input
            className="w-full border rounded p-2"
            value={industries}
            onChange={(e) => setIndustries(e.target.value)}
            aria-label="Industries"
            placeholder="e.g., Tech; Finance"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          disabled={saving}
          aria-label="Save profile"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        {error && (
          <div role="alert" className="text-sm text-red-600">
            Save failed ({error}). Your changes were not applied.
          </div>
        )}
      </form>

      {toast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
