import { db } from "@/lib/db";
import FeedView from "@/components/feed/FeedView";

export default async function FeedPage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <section>
      <h1 className="text-xl font-semibold mb-4">Feed</h1>
      <FeedView posts={posts} />
    </section>
  );
}
