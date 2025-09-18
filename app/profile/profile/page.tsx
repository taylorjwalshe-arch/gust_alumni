'use client';

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>You must be signed in to view this page.</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Welcome, {session.user?.name}</h1>
      <p className="text-gray-600">{session.user?.email}</p>
    </div>
  );
}
