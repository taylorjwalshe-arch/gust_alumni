import type { Post } from "@prisma/client";
import FeedItemCard from "./FeedItemCard";

export default function FeedView({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {posts.map((p) => (
        <FeedItemCard key={p.id} post={p} />
      ))}
    </div>
  );
}
