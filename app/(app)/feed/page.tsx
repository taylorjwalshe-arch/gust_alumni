import { Suspense } from "react";
import NewSocialForm from "@/components/social/NewSocialForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function FeedPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Feed</h1>
      <Suspense fallback={<div role="status" className="p-4 text-sm text-gray-600">Loading…</div>}>
        <NewSocialForm />
      </Suspense>
    </div>
  );
}
