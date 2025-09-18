import { getTeamBySlug, getFilteredPosts } from '@/lib/data'
import { TeamBanner } from '@/components/teams/TeamBanner'
import FeedList from '@/components/feed/FeedList'

interface Props {
  params: {
    slug: string
  }
  searchParams: {
    q?: string
    role?: string
    location?: string
  }
}

export default async function TeamFeedPage({ params, searchParams }: Props) {
  const team = await getTeamBySlug(params.slug)
  if (!team) return null

  const posts = await getFilteredPosts({
    teamId: team.id,
    query: searchParams.q,
    role: searchParams.role,
    location: searchParams.location,
  })

  return (
    <div>
      <TeamBanner team={team} />
      <h1 className="text-2xl font-semibold mb-4">Feed</h1>
      <form className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search posts"
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="role"
          defaultValue={searchParams.role}
          placeholder="Filter by role"
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="location"
          defaultValue={searchParams.location}
          placeholder="Filter by location"
          className="border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
        >
          Apply
        </button>
      </form>
      <FeedList posts={posts} />
    </div>
  )
}
