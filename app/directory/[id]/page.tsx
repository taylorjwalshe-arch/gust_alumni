"use client";
import { useParams } from "next/navigation";
import DirectoryDetailView from "@/components/directory/DirectoryDetailView";

export default function DirectoryDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  return <DirectoryDetailView id={id} />;
}
