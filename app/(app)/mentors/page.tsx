// app/(app)/mentors/page.tsx
import MentorsView from "@/components/mentors/MentorsView";

export const metadata = {
  title: "Mentors",
};

export default function Page() {
  return <MentorsView />;
}
