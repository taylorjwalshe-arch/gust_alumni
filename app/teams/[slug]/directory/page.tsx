export default function TeamDirectoryPage({ params }: { params: { slug: string } }) {
  return (
    <section>
      <h1 className="text-2xl font-bold capitalize">Directory — {params.slug}</h1>
      <p className="text-gray-600 mt-2">Filtered view of directory for this team coming soon.</p>
    </section>
  );
}
