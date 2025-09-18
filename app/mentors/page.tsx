import { Suspense } from "react";
import MentorsView from "@/components/mentors/MentorsView";

export default function MentorsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Mentors</h1>
      <Suspense fallback={<p>Loading mentors...</p>}>
        <MentorsView />
      </Suspense>
    </main>
  );
}
