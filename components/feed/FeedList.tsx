import { Post, Person } from '@prisma/client'

export function FeedList({ posts }: { posts: (Post & { poster: Person | null })[] }) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border rounded shadow">
          <div className="font-semibold">{post.poster?.firstName} {post.poster?.lastName}</div>
          <div className="text-sm text-gray-600 mt-1">{post.content}</div>
        </div>
      ))}
    </div>
  )
}
