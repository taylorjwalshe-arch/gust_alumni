import { getTeamBySlug, getTeamJobs } from '@/lib/data'
import { TeamBanner } from '@/components/teams/TeamBanner'
import JobCard from '@/components/jobs/JobCard'

interface Props {
  params: {
    slug: string
  }
}

export default async function TeamJobsPage({ params }: Props) {
  const team = await getTeamBySlug(params.slug)
  if (!team) return null

  const jobs = await getTeamJobs(team.id)

  return (
    <div>
      <TeamBanner team={team} />
      <h1 className="text-2xl font-semibold mb-4">Jobs</h1>
      {jobs.length === 0 ? (
        <p className="text-muted-foreground">No jobs found for this team.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
