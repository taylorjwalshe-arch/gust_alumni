"use client";

import { useSearchParams } from "next/navigation";
import NewJobForm from "./NewJobForm";

export default function JobsNewClient() {
  useSearchParams();
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Post a Job</h1>
      <NewJobForm />
    </div>
  );
}
