import { prisma } from "@/lib/db";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: {
      postedAt: "desc",
    },
  });

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">All Jobs</h1>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs found.</p>
      ) : (
        <ul className="grid gap-4">
          {jobs.map((job) => (
            <li key={job.id} className="border p-4 rounded shadow-sm">
              <h2 className="font-semibold">{job.title}</h2>
              <p className="text-sm text-gray-600">{job.company}</p>
              <p className="text-sm text-gray-500">{job.location}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
