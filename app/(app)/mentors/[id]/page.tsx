// app/(app)/mentors/[id]/page.tsx
import { use } from 'react';
import MentorDetailView from "@/components/mentors/MentorDetailView";

export const metadata = { title: "Mentor" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <MentorDetailView id={id} />;
}
