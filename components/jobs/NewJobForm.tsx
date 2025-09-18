"use client";

import { useState } from "react";

export default function NewJobForm() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Job Title</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Company</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <button
        type="button"
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        onClick={() => alert("Stub: Submit job")}
      >
        Submit Job
      </button>
    </form>
  );
}
