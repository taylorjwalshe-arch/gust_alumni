import { prisma } from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/authLoose'
import FeedPostDate from '@/components/feed/FeedPostDate'
import { DeletePostButton } from '@/components/feed/DeletePostButton'

type Props = {
  params: { slug: string }
}

export default async function TeamFeedPage({ params }: Props) {
  const session = await getServerAuthSession()

  const posts = await prisma.post.findMany({
    where: {
      author: { teamAffiliation: params.slug },
    },
    include: { author: true },
    orderBy: { postedAt: 'desc' },
  })

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <p className="text-muted-foreground text-center mt-8">No posts from this team yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border rounded-lg p-4 shadow-sm bg-white">
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
          </div>
        ))
      )}
    </div>
  )
}
