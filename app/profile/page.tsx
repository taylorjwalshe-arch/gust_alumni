import { Suspense } from "react";

export default function MyProfilePage() {
  return (
    <Suspense fallback={<p>Loading profile...</p>}>
      <div className="p-4">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="mt-2 text-gray-600">User-specific profile info will be displayed here.</p>
      </div>
    </Suspense>
  );
}
