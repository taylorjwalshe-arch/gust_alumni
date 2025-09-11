import { Suspense } from "react";
import ProfileClient from "@/components/profile/ProfileClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfileClient />
    </Suspense>
  );
}
