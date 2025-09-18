import { db } from "@/lib/db";
import JobsView from "@/components/jobs/JobsView";

export default async function JobsPage() {
  const jobs = await db.job.findMany({ orderBy: { postedAt: "desc" } });

  return (
    <section>
      <h1 className="text-xl font-semibold mb-4">Jobs</h1>
      <JobsView jobs={jobs} />
    </section>
  );
}
