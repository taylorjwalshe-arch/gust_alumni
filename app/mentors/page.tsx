export const dynamic = "force-dynamic";
export const revalidate = 0;
import { Suspense } from "react";
import MentorSuggestCard from "@/components/mentors/MentorSuggestCard";
import MatchHistory from "@/components/mentors/MatchHistory";

export default async function MentorsPage() {
  return (
    <div className="p-6 space-y-6">
      <MentorSuggestCard />
      <Suspense fallback={null}>
        <MatchHistory />
      </Suspense>
    </div>
  );
}
