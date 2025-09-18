'use client';

import Link from 'next/link';

export default function DirectoryCard({
  person,
}: {
  person: {
    id: string;
    firstName?: string;
    lastName?: string;
    location?: string;
    industries?: string[];
  };
}) {
  if (!person) {
    console.error('❌ DirectoryCard received undefined person prop');
    return null;
  }

  const name = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim();
  const location = person.location ?? '';
  const avatarFallback = (person.firstName?.[0] ?? 'U').toUpperCase();

  return (
    <div style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
      <Link href={`/directory/${person.id}`} prefetch={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#ccc',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {avatarFallback}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{name}</div>
            {location && <div style={{ fontSize: 13, color: '#6b7280' }}>{location}</div>}
          </div>
        </div>
      </Link>
    </div>
  );
}
