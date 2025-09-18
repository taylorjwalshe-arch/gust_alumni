import { db } from "@/lib/db";

export default async function TeamFeedPage({ params }: { params: { slug: string } }) {
  const posts = await db.post.findMany({
    where: {
      teamAffiliation: params.slug,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <h1 className="text-2xl font-bold capitalize mb-4">Feed — {params.slug}</h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts found for this team.</p>
      ) : (
        <ul className="grid gap-4">
          {posts.map((post) => (
            <li key={post.id} className="border p-4 rounded shadow-sm">
              <h2 className="font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500">{post.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
