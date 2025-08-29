import { prisma } from "@/lib/db";

export default async function ProfileByIdPage({ params }: { params: { id: string } }) {
  const person = await prisma.person.findUnique({ where: { id: params.id } });

  if (!person) {
    return (
      <main className="max-w-2xl mx-auto py-12">
        <h1 className="text-xl font-semibold mb-4">Profile not found.</h1>
        <a href="/directory" className="text-blue-600 underline">← Back to Directory</a>
      </main>
    );
  }

  const industries = Array.isArray(person.industries) ? (person.industries as string[]) : [];

  return (
    <main className="max-w-2xl mx-auto py-12 space-y-3">
      <h1 className="text-2xl font-bold">
        {person.firstName} {person.lastName}
      </h1>
      <div className="text-sm text-muted-foreground">
        {person.role.toUpperCase()} {person.gradYear ? `· ${person.gradYear}` : ""}
      </div>
      <div className="text-sm">
        {industries.length ? industries.join(", ") : "—"} {person.company ? `@ ${person.company}` : ""}
      </div>
      <div className="text-sm">{person.location ?? "—"}</div>
      {person.bio && <p className="pt-4 whitespace-pre-wrap">{person.bio}</p>}
    </main>
  );
}
