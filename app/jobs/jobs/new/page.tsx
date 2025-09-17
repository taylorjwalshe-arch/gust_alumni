import { Suspense } from "react";
import JobsNewClient from "@/components/jobs/JobsNewClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function JobsNewPage() {
  return (
    <Suspense fallback={<div role="status" className="p-4 text-sm text-gray-600">Loading…</div>}>
      <JobsNewClient />
    </Suspense>
  );
}
