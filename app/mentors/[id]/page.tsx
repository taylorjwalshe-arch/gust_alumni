"use client";
import { useParams } from "next/navigation";
import MentorDetailView from "@/components/mentors/MentorDetailView";

export default function MentorDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  return <MentorDetailView id={id} />;
}
