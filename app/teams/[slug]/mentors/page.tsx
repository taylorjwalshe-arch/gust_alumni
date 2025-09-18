import { getTeamMentors } from '@/lib/data'
import { SuggestMentorsButton } from '@/components/mentors/SuggestMentorsButton'
import MentorCard from '@/components/mentors/MentorCard'

interface Props {
  params: { slug: string }
}

export default async function TeamMentorsPage({ params }: Props) {
  const mentors = await getTeamMentors(params.slug)

  return (
    <div className="space-y-6">
      <SuggestMentorsButton />
      {mentors.length === 0 ? (
        <p className="text-muted-foreground text-center">No mentors for this team yet.</p>
      ) : (
        mentors.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)
      )}
    </div>
  )
}
