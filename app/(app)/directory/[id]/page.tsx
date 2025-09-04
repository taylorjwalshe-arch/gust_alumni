// app/(app)/directory/[id]/page.tsx
import DirectoryDetailView from "@/components/directory/DirectoryDetailView";
export const metadata = { title: "Person" };
export default function Page({ params }: { params: { id: string } }) {
  return <DirectoryDetailView id={params.id} />;
}
