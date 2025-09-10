"use client";
import React from "react";
import { useRouter } from "next/navigation";

type CreateResponse =
  | { created: true; item: { id: string } }
  | { created: false; item: null; reason: string };

export default function JobNewForm() {
  const [title, setTitle] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [isRequest, setIsRequest] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || null,
          company: company || null,
          location: location || null,
          isRequest,
          postedAt: new Date().toISOString(),
        }),
      });
      const json = (await res.json()) as CreateResponse;
      if ("created" in json && json.created && json.item?.id) {
        router.push(`/jobs/${json.item.id}`);
      } else {
        setError("Could not create. Model may be missing.");
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
        <label className="block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Software Engineer"
          className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Company</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Acme Inc."
          className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Boston, MA"
          className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="req"
          type="checkbox"
          checked={isRequest}
          onChange={(e) => setIsRequest(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="req" className="text-sm">Post as request (anonymous)</label>
      </div>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Post"}
      </button>
    </form>
  );
}
