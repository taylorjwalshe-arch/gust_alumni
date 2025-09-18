'use client'

import { useMemo, useState } from 'react'
import { PostWithAuthor } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface FeedListProps {
  posts: PostWithAuthor[]
  search?: string
}

export function FeedList({ posts, search = '' }: FeedListProps) {
  const [filter, setFilter] = useState<'all' | 'offers' | 'requests'>('all')

  const filtered = useMemo(() => {
    let list = posts
    if (filter !== 'all') {
      list = list.filter((p) =>
        filter === 'offers' ? !p.isRequest : p.isRequest
      )
    }
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(s) ||
          p.author?.firstName?.toLowerCase().includes(s) ||
          p.author?.lastName?.toLowerCase().includes(s)
      )
    }
    return list
  }, [posts, filter, search])

  return (
    <div className="space-y-4">
      {filtered.map((post) => (
        <div
          key={post.id}
          className={cn(
            'rounded-xl border p-4 bg-white shadow-sm',
            post.isRequest ? 'border-red-200' : 'border-green-200'
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback>
                {post.author?.firstName?.[0]}
                {post.author?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              {post.author?.firstName} {post.author?.lastName} ·{' '}
              {formatDistanceToNow(new Date(post.postedAt), { addSuffix: true })}
            </div>
          </div>
          <div className="text-sm whitespace-pre-wrap">{post.content}</div>
        </div>
      ))}
    </div>
  )
}
