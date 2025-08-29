// components/mentors/MentorCard.tsx
'use client';
import Link from 'next/link';

export type MentorListItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  industry?: string | null;        // legacy single field (may be null)
  industries?: string[] | null;     // new array field (optional)
  location: string | null;
  imageUrl: string | null;
  expertise?: string[] | null;      // optional
};

export function MentorCard({ m }: { m: MentorListItem }) {
  const name = `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || 'Unnamed';
  const tags = (m.industries && m.industries.length ? m.industries.slice(0, 3) : [])
    .concat(m.industry ? [m.industry] : []);

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
        {!!tags.length && (
          <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full border">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
