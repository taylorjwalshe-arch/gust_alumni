import type { Job } from "@prisma/client";
import JobCard from "./JobCard";

export default function JobsView({ jobs }: { jobs: Job[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} />
      ))}
    </div>
  );
}
