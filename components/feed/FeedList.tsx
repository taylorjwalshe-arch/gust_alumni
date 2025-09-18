'use client'

import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import FeedPostDate from './FeedPostDate'
import FeedSkeleton from './FeedSkeleton'

type Post = {
  id: string
  content: string
  createdAt: string
  author: {
    name: string
    image: string
  }
}

export default function FeedList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [optimisticPost, setOptimisticPost] = useState<Post | null>(null)

  useEffect(() => {
    fetch('/api/feed')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      setOptimisticPost({
        id: 'temp-id',
        content: event.detail.content,
        createdAt: new Date().toISOString(),
        author: {
          name: event.detail.name,
          image: event.detail.image,
        },
      })
    }
    window.addEventListener('new-post', handler as EventListener)
    return () => window.removeEventListener('new-post', handler as EventListener)
  }, [])

  if (loading) return <FeedSkeleton />

  const allPosts = optimisticPost ? [optimisticPost, ...posts] : posts

  return (
    <div className="flex flex-col gap-6">
      {allPosts.map((post) => (
        <div key={post.id} className="bg-white dark:bg-zinc-900 border border-border p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Avatar name={post.author.name} src={post.author.image} className="h-8 w-8" />
            <div>
              <div className="text-sm font-semibold">{post.author.name}</div>
              <FeedPostDate dateString={post.createdAt} />
            </div>
          </div>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</div>
        </div>
      ))}
    </div>
  )
}
