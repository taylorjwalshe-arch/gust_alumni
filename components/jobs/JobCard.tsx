import type { Job } from "@prisma/client";

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="rounded border p-4 shadow-sm hover:shadow-md transition">
      <h2 className="text-lg font-semibold">{job.title}</h2>
      <p className="text-sm text-gray-600">{job.company}</p>
      <p className="text-sm text-gray-500">{job.location}</p>
    </div>
  );
}
