import { getServerAuthSession } from "@/lib/authLoose";

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  if (!session) {
    return (
      <div className="p-4 text-red-600">
        You must be signed in to view this page.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Welcome, {session.user?.name}</h1>
      <p className="text-gray-600">{session.user?.email}</p>
    </div>
  );
}
