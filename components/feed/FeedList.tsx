'use client'

import { Post, Person } from '@prisma/client'
import { Avatar } from '@/components/ui/avatar'
import FeedPostDate from './FeedPostDate'

type PostWithAuthor = Post & { author: Person | null }

export default function FeedList({ posts }: { posts: PostWithAuthor[] }) {
  if (posts.length === 0) return <p className="text-muted-foreground text-sm">No posts yet.</p>

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white dark:bg-zinc-900 p-4 rounded-md shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Avatar name={post.author?.firstName || 'Unknown'} className="h-8 w-8" />
            <div className="flex flex-col">
              <p className="font-medium text-sm">
                {post.author?.firstName} {post.author?.lastName}
              </p>
              <FeedPostDate date={post.postedAt} />
            </div>
          </div>
          <p className="text-sm whitespace-pre-line">{post.content}</p>
        </div>
      ))}
    </div>
  )
}
