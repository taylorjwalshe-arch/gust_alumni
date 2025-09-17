import { Suspense } from "react";
import DirectorySearchShell from "@/components/directory/DirectorySearchShell";

export default function DirectoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Directory</h1>
      <Suspense fallback={<p className="text-gray-500">Loading directory...</p>}>
        <DirectorySearchShell />
      </Suspense>
    </div>
  );
}
