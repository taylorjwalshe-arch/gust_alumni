import { db } from "@/lib/db";

export default async function JobsIndexPage() {
  const jobs = await db.job.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Jobs</h1>
      {jobs?.length ? (
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li key={job.id} className="border p-2 rounded">
              <h2 className="font-semibold">{job.title}</h2>
              <p className="text-sm">{job.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No jobs found.</p>
      )}
    </div>
  );
}
