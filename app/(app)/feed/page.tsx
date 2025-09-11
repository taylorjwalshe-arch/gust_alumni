import { Suspense } from "react";
import FeedClient from "@/components/feed/FeedClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FeedClient />
    </Suspense>
  );
}
