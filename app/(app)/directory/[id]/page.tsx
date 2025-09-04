// app/(app)/directory/[id]/page.tsx
import { use } from 'react';
import DirectoryDetailView from '@/components/directory/DirectoryDetailView';

// Next.js 15 dynamic routes: params is a Promise
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // If your detail view reads the id internally via useParams, no need to unwrap:
  // const { id } = use(params); // uncomment + pass to the component if needed
  return <DirectoryDetailView />;
}
