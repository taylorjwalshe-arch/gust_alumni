import { getTeamBySlug } from '@/lib/data'
import { TeamBanner } from '@/components/teams/TeamBanner'
import { Card, CardContent } from '@/components/ui/card'

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
      <div className="max-w-xl mx-auto mt-12">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-semibold">Social</h1>
            <p className="mt-4 text-muted-foreground">This team’s social dashboard is coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
