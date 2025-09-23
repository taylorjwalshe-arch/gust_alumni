"use client";
import { useParams } from "next/navigation";
import ProfileDetailView from "@/components/profile/ProfileDetailView";

export default function ProfileDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  return <ProfileDetailView id={id} />;
}
