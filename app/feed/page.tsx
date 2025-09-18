import { prisma } from '@/lib/db'
import { getServerAuthSession } from '@/lib/authLoose'
import { FeedPostModal } from '@/components/feed/FeedPostModal'
import { FeedList } from '@/components/feed/FeedList'

export default async function FeedPage() {
  const session = await getServerAuthSession()

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { poster: true },
  })

  return (
    <div className="p-6">
      <FeedList posts={posts} />
      <FeedPostModal onPost={(content) => console.log('TODO: Submit post', content)} />
    </div>
  )
}
