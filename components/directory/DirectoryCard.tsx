import Link from 'next/link';

export type DirectoryCardProps = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  industries?: string[] | null;
  location?: string | null;
};

export default function DirectoryCard({
  id,
  firstName,
  lastName,
  industries,
  location,
}: DirectoryCardProps) {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Unnamed';
  const tags = Array.isArray(industries) ? industries.slice(0, 3) : [];

  return (
    <Link
      href={`/directory/${id}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: tags.length > 0 ? 8 : 4 }}>
        {name}
      </div>

      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: location ? 6 : 0 }}>
          {tags.map((t, i) => (
            <span
              key={`${id}-ind-${i}`}
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {location && <div style={{ fontSize: 13, color: '#6b7280' }}>{location}</div>}
    </Link>
  );
}
