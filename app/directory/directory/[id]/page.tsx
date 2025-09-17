import DirectoryDetailView from "@/components/directory/DirectoryDetailView";
import PersonJobsList from "@/components/directory/PersonJobsList";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <DirectoryDetailView />
      <PersonJobsList />
    </div>
  );
}
