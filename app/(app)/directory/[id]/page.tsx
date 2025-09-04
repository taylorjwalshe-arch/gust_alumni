// app/(app)/directory/[id]/page.tsx
import { use } from 'react';
import DirectoryDetailView from '@/components/directory/DirectoryDetailView';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <DirectoryDetailView id={id} />;
}
