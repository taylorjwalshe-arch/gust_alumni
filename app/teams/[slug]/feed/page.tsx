export default function TeamFeedPage({ params }: { params: { slug: string } }) { 
  return (
    <section>
      <h1 className="text-2xl font-bold capitalize">Feed — {params.slug}</h1>
      <p className="text-gray-600 mt-2">Team-specific feed will go here.</p>
    </section>
  );
}
