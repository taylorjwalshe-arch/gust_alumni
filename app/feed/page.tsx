import { prisma } from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/authLoose'
import { DeletePostButton } from '@/components/feed/DeletePostButton'
import FeedPostDate from '@/components/feed/FeedPostDate'
import { notFound } from 'next/navigation'

export default async function FeedPage({ searchParams }: { searchParams?: { page?: string } }) {
  const session = await getServerAuthSession()
  const page = parseInt(searchParams?.page || '1', 10)
  const pageSize = 10
  const skip = (page - 1) * pageSize

  if (page < 1 || isNaN(page)) return notFound()

  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { postedAt: 'desc' },
    skip,
    take: pageSize,
  })

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground mt-8">No posts yet.</p>
      ) : (
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
      )}

      <div className="flex justify-between pt-4">
        <a
          className={`px-4 py-2 rounded bg-muted text-muted-foreground ${
            page <= 1 ? 'pointer-events-none opacity-50' : ''
          }`}
          href={`/feed?page=${page - 1}`}
        >
          Previous
        </a>
        <a
          className={`px-4 py-2 rounded bg-muted text-muted-foreground ${
            posts.length < pageSize ? 'pointer-events-none opacity-50' : ''
          }`}
          href={`/feed?page=${page + 1}`}
        >
          Next
        </a>
      </div>
    </main>
  )
}
