"use client";

import { useState } from "react";

export default function NewJobForm() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [isRequest, setIsRequest] = useState(false);
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, company, location, isRequest, description }),
      });
      const json = await res.json();
      const id = (json && json.item && json.item.id) || "";
      if (id) window.location.href = `/jobs/${encodeURIComponent(id)}`;
      else alert("Submitted (no id returned).");
    } catch {
      alert("Submit failed (safe fallback).");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input className="w-full border rounded p-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Company</label>
        <input className="w-full border rounded p-2" value={company} onChange={(e) => setCompany(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Location</label>
        <input className="w-full border rounded p-2" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <input id="isRequest" type="checkbox" checked={isRequest} onChange={(e) => setIsRequest(e.target.checked)} />
        <label htmlFor="isRequest" className="text-sm">This is a job request (seeking help)</label>
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea className="w-full border rounded p-2 h-32" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Post</button>
    </form>
  );
}
