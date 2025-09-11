import { Suspense } from "react";
import ProfileClient from "@/components/profile/ProfileClient";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-gray-600" role="status" aria-label="Loading profile">
          Loading…
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  );
}
