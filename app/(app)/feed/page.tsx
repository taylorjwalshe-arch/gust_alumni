import FeedView from "@/components/feed/FeedView";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Home Feed</h1>
      <FeedView />
    </div>
  );
}
