import { Suspense } from "react";
import JobsIndexClient from "@/components/jobs/JobsIndexClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JobsIndexClient />
    </Suspense>
  );
}
