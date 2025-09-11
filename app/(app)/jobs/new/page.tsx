import { Suspense } from "react";
import JobsNewClient from "@/components/jobs/JobsNewClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <JobsNewClient />
    </Suspense>
  );
}
