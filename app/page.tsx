export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">GUST Alumni</h1>
      <p className="mt-2 text-gray-700">Use the navigation to access the directory.</p>
      <p className="mt-4">
        <a href="/directory" className="text-blue-600 underline">Go to Directory →</a>
      </p>
    </main>
  );
}
