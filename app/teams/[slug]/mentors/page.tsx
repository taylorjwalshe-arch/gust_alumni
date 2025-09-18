import { getTeamBySlug, getMentorsByTeamSlug } from '@/lib/data'
import { SuggestMentorsButton } from '@/components/mentors/SuggestMentorsButton'
import MentorCard from '@/components/mentors/MentorCard'
import { getServerAuthSession } from '@/lib/authLoose'
import { TeamBanner } from '@/components/teams/TeamBanner'

interface Props {
  params: {
    slug: string
  }
}

export default async function TeamMentorsPage({ params }: Props) {
  const team = await getTeamBySlug(params.slug)
  if (!team) return null

  const mentors = await getMentorsByTeamSlug(params.slug)
  const session = await getServerAuthSession()

  return (
    <div>
      <TeamBanner team={team} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Mentors</h1>
        {session?.user.teamAffiliation === params.slug && <SuggestMentorsButton />}
      </div>
      {mentors.length === 0 ? (
        <p className="text-center text-muted-foreground mt-8">No mentors listed yet.</p>
      ) : (
        <ul className="space-y-4">
          {mentors.map((mentor) => (
            <li key={mentor.id}>
              <MentorCard mentor={mentor} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
