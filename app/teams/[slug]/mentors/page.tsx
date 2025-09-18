import { getTeamMentors } from '@/lib/data'
import { MentorCard } from '@/components/mentors/MentorCard'

export default async function TeamMentorsPage({ params }: { params: { slug: string } }) {
  const mentors = await getTeamMentors(params.slug)

  if (mentors.length === 0) {
    return <p className="text-center text-muted-foreground py-16">No mentors found for this team.</p>
  }

  return (
    <ul className="space-y-4">
      {mentors.map((mentor) => (
        <MentorCard key={mentor.id} mentor={mentor} />
      ))}
    </ul>
  )
}
