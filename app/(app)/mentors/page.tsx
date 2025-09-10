import MentorSuggestCard from "@/components/mentors/MentorSuggestCard";
import MentorsView from "@/components/mentors/MentorsView";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <MentorSuggestCard />
      <MentorsView />
    </div>
  );
}
