import { Suspense } from "react";
import ImportClient from "@/components/admin/ImportClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminImportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4" role="status" aria-label="Loading admin import">
          <div className="h-6 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-64 w-full bg-gray-100 rounded animate-pulse" />
        </div>
      }
    >
      <ImportClient />
    </Suspense>
  );
}
