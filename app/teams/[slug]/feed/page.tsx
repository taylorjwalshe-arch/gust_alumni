import { getTeamFeed } from '@/lib/data'
import FeedPostDate from '@/components/feed/FeedPostDate'

export default async function TeamFeedPage({ params }: { params: { slug: string } }) {
  const posts = await getTeamFeed(params.slug)

  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground py-16">No posts yet for this team.</p>
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="text-sm font-semibold">
            {post.author.firstName} {post.author.lastName}
          </div>
          <FeedPostDate date={post.postedAt} />
          <p className="mt-2 text-gray-800">{post.content}</p>
        </li>
      ))}
    </ul>
  )
}
