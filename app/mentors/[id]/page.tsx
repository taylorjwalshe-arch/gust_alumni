import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MentorDetailView from "@/components/mentors/MentorDetailView";

export default async function MentorDetailPage(props: unknown) {
  const id = (props as { params?: { id?: string } })?.params?.id;
  if (!id) return notFound();

  const mentor = await prisma.person.findUnique({
    where: { id },
  });

  if (!mentor) return notFound();

  return <MentorDetailView id={mentor.id} />;
}
