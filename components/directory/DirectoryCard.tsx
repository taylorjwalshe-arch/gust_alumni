// components/directory/DirectoryCard.tsx
'use client';
import Link from 'next/link';

export type DirectoryListItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  location?: string | null;
  imageUrl?: string | null;
  industries?: string[] | null;
};

export function DirectoryCard({ item }: { item: DirectoryListItem }) {
  const name = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || 'Unnamed';
  const mono = (item.firstName?.[0] ?? '') + (item.lastName?.[0] ?? '');
  const avatar = item.imageUrl ?? null;
  const tag = (item.industries && item.industries.length) ? item.industries[0] : null;

  return (
    <Link href={`/directory/${item.id}`} className="block">
      <div className="rounded-2xl bg-white/5 p-4 border border-gray-200 hover:shadow-md transition">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover bg-gray-100" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
              {mono || '—'}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium truncate">{name}</div>
            <div className="text-xs text-gray-500 truncate">{item.location ?? (tag ?? '—')}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
