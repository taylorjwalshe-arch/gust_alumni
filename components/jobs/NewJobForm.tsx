"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

export default function NewJobForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action="/app/actions/postJob" className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Job Title</label>
        <input name="title" required className="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Company</label>
        <input name="company" required className="w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Location</label>
        <input name="location" className="w-full border rounded px-3 py-2" />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Submitting..." : "Submit Job"}
    </button>
  );
}
