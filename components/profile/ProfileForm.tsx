"use client";
import React from "react";
import { useRouter } from "next/navigation";

type SaveResp =
  | { saved: true; id: string; person?: { id: string } }
  | { saved: false; id: null; reason?: string };

function splitIndustries(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProfileForm() {
  const [id, setId] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [industries, setIndustries] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id || null,
          firstName: firstName || null,
          lastName: lastName || null,
          email: email || null,
          location: location || null,
          industries: industries ? splitIndustries(industries) : null,
        }),
      });
      const json = (await res.json()) as SaveResp;
      if ("saved" in json && json.saved && json.id) {
        router.push(`/directory/${json.id}`);
      } else {
        setError("Could not save profile.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Claim by Person ID (optional)</label>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Paste an existing Person id to claim"
          className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">First name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Taylor"
            className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Last name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Walshe"
            className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Washington, DC"
          className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Industries (comma-separated)</label>
        <input
          value={industries}
          onChange={(e) => setIndustries(e.target.value)}
          placeholder="Tech, Finance"
          className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
