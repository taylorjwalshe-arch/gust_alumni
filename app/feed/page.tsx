import { Suspense } from "react";

export default function FeedPage() {
  return (
    <Suspense fallback={<p>Loading feed...</p>}>
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <p className="mt-2 text-gray-600">This is where updates, news, and announcements will go.</p>
      </div>
    </Suspense>
  );
}
