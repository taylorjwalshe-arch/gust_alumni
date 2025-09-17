"use client";

import { useSearchParams } from "next/navigation";
import DirectoryView from "./DirectoryView";

export default function DirectorySearchShell() {
  const params = useSearchParams();
  const filter = params.get("filter") ?? "";

  return <DirectoryView filter={filter} />;
}
