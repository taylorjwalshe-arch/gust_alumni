// app/(app)/mentors/[id]/page.tsx
import MentorDetailView from "@/components/mentors/MentorDetailView";

export const metadata = { title: "Mentor" };

export default function Page({ params }: { params: { id: string } }) {
  return <MentorDetailView id={params.id} />;
}
