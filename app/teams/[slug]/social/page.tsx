import { getTeamBySlug } from '@/lib/data'
import { TeamBanner } from '@/components/teams/TeamBanner'

interface Props {
  params: {
    slug: string
  }
}

export default async function TeamSocialPage({ params }: Props) {
  const team = await getTeamBySlug(params.slug)
  if (!team) return null

  return (
    <div>
      <TeamBanner team={team} />
      <div className="text-center mt-12">
        <h1 className="text-2xl font-semibold">Social</h1>
        <p className="mt-4 text-muted-foreground">Social dashboard coming soon.</p>
      </div>
    </div>
  )
}
