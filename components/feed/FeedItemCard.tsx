import type { Post } from "@prisma/client";

export default function FeedItemCard({ post }: { post: Post }) {
  return (
    <div className="rounded border p-4 shadow-sm hover:shadow-md transition">
      <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
      <p className="text-sm text-gray-500 mb-2">{post.type}</p>
      <p className="text-sm text-gray-700">{post.content?.slice(0, 140)}...</p>
    </div>
  );
}
