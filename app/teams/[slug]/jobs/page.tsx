import { getTeamJobs } from '@/lib/data'
import { JobCard } from '@/components/jobs/JobCard'

export default async function TeamJobsPage({ params }: { params: { slug: string } }) {
  const jobs = await getTeamJobs(params.slug)

  if (jobs.length === 0) {
    return <p className="text-center text-muted-foreground py-16">No jobs posted for this team.</p>
  }

  return (
    <ul className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </ul>
  )
}
