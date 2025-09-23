import { prisma } from "@/lib/prisma";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Jobs</h1>
      <ul className="mt-4 space-y-2">
        {jobs.map((job) => (
          <li key={job.id}>
            <a href={`/jobs/${job.id}`} className="text-blue-600 hover:underline">
              {job.title} – {job.company}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
