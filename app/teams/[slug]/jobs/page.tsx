export default function TeamJobsPage({ params }: { params: { slug: string } }) { 
  return (
    <section>
      <h1 className="text-2xl font-bold capitalize">Jobs — {params.slug}</h1>
      <p className="text-gray-600 mt-2">Only jobs posted by this team will show here.</p>
    </section>
  );
}
