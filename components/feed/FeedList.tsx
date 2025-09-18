import { prisma } from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/authLoose'
import { DeletePostButton } from '@/components/feed/DeletePostButton'
import FeedPostDate from './FeedPostDate'

export default async function FeedList() {
  const session = await getServerAuthSession()
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { postedAt: 'desc' },
  })

  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No posts yet.</p>
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
          {session?.user?.id === post.authorId && (
            <div className="mt-2">
              <DeletePostButton id={post.id} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
