"use client";
import { useParams } from "next/navigation";
import JobDetailView from "@/components/jobs/JobDetailView";

export default function JobDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  return <JobDetailView id={id} />;
}
