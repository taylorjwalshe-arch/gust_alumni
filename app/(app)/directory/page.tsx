import { Suspense } from "react";
import DirectoryIndexClient from "@/components/directory/DirectoryIndexClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DirectoryIndexClient />
    </Suspense>
  );
}
