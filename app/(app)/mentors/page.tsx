import { Suspense } from "react";
import MentorsClient from "@/components/mentors/MentorsClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MentorsClient />
    </Suspense>
  );
}
