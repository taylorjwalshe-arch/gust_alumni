import { DirectorySearchShell } from "@/components/directory/DirectorySearchShell";
import { DirectoryView } from "@/components/directory/DirectoryView";

export default function DirectoryPage() {
  return (
    <div className="space-y-4">
      <DirectorySearchShell />
      <DirectoryView />
    </div>
  );
}
