import { db } from "@/lib/db"
import { getServerAuthSession } from "@/lib/authLoose"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default async function FeedPage() {
  const session = await getServerAuthSession()
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true },
  })

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Community Feed</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border p-4 rounded shadow-sm space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{post.author?.name ?? "Unknown"}</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
            <h2 className="font-semibold text-lg">{post.title}</h2>
            <p className="text-sm text-gray-700">{post.content.slice(0, 140)}...</p>
            {session && (
              <button className="mt-2 text-sm text-blue-600 hover:underline">
                Offer Help
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
