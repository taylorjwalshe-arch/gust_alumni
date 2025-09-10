export default function TeamPageShell({ slug }: { slug: string }) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Team: {slug}</h1>
      <p className="text-gray-600">This is the starting point for the {slug} portal.</p>
    </div>
  );
}
