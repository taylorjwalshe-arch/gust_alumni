import TeamPageShell from "@/components/teams/TeamPageShell";

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params;
  const slug = p?.slug ?? "";
  return <TeamPageShell slug={slug} />;
}
