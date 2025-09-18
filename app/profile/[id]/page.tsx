import { db } from "@/lib/db";

export default async function ProfileDetailPage({ params }: { params: { id: string } }) {
  const user = await db.user.findUnique({
    where: { id: params.id }
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{user?.name || "User not found"}</h1>
      <p>{user?.email}</p>
    </div>
  );
}
