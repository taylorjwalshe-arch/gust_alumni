import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FeedList from '@/components/feed/FeedList'
import { Avatar } from '@/components/ui/avatar'
import Link from 'next/link'

export default async function FeedPage() {
  const session = await getServerAuthSession()
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { postedAt: 'desc' },
  })

  const user = session?.user

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {user && (
        <div className="bg-white dark:bg-zinc-900 border border-border rounded-md p-4 flex items-center gap-3">
          <Avatar name={user.name || 'User'} className="h-10 w-10" />
          <Link
            href="#"
            className="flex-1 rounded-full border border-border px-4 py-2 text-muted-foreground text-sm hover:bg-accent"
          >
            Start a post...
          </Link>
        </div>
      )}
      <FeedList posts={posts} />
    </div>
  )
}
