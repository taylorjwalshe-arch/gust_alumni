import { db } from "@/lib/db";

export default async function TeamJobsPage({ params }: { params: { slug: string } }) {
  const jobs = await db.job.findMany({
    where: {
      poster: {
        person: {
          teamAffiliation: params.slug,
        },
      },
    },
    orderBy: { postedAt: "desc" },
    take: 12,
  });

  return (
    <section>
      <h1 className="text-2xl font-bold capitalize mb-4">Jobs — {params.slug}</h1>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs found for this team.</p>
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
