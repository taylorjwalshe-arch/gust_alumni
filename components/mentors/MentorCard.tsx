// components/mentors/MentorCard.tsx
'use client';
import Link from 'next/link';

export type MentorListItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  industry: string | null;
  location: string | null;
  imageUrl: string | null;
};

export function MentorCard({ m }: { m: MentorListItem }) {
  const name = `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || 'Unnamed';
  return (
    <Link href={`/mentors/${m.id}`} className="block group">
      <div className="rounded-2xl bg-white/5 p-4 border border-gray-200 hover:shadow-md transition">
        <div className="flex items-center gap-3">
          <img
            src={m.imageUrl || '/avatar-placeholder.png'}
            alt={name}
            className="h-12 w-12 rounded-full object-cover bg-gray-100"
          />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-gray-500">{m.headline ?? '—'}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-2">
          {m.industry && <span className="px-2 py-0.5 rounded-full border">{m.industry}</span>}
          {m.location && <span className="px-2 py-0.5 rounded-full border">{m.location}</span>}
        </div>
      </div>
    </Link>
  );
}
