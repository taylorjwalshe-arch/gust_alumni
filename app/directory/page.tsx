import { db } from "@/lib/db";
import { DirectoryView } from "@/components/directory/DirectoryView";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { DirectorySearchShell } from "@/components/directory/DirectorySearchShell";

interface SearchParams {
  industry?: string;
  location?: string;
}

export default async function DirectoryPage({ searchParams }: { searchParams?: SearchParams }) {
  const filters: any = {};

  if (searchParams?.industry) {
    filters.industries = { array_contains: searchParams.industry };
  }

  if (searchParams?.location) {
    filters.location = searchParams.location;
  }

  const people = await db.person.findMany({
    where: filters,
    orderBy: { lastName: "asc" },
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Directory</h1>
      <DirectorySearchShell>
        <DirectoryFilters active={searchParams} />
        <DirectoryView people={people} />
      </DirectorySearchShell>
    </section>
  );
}
