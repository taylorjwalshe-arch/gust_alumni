export default function TeamLandingPage({ params }: { params: { slug: string } }) {
  return (
    <section>
      <h1 className="text-2xl font-bold capitalize">{params.slug} Team</h1>
      <p className="text-gray-600 mt-2">Choose from directory, jobs, feed and more.</p>
    </section>
  );
}
