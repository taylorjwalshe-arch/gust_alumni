import { Person } from '@prisma/client'
import Link from 'next/link'

export function DirectoryList({ people }: { people: Person[] }) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {people.map((person) => (
        <li key={person.id} className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="text-lg font-medium">
            {person.firstName} {person.lastName}
          </div>
          <div className="text-muted-foreground">{person.company || person.expertise}</div>
          <Link href={`/profile/${person.id}`} className="text-sm text-blue-600 mt-2 inline-block">
            View Profile
          </Link>
        </li>
      ))}
    </ul>
  )
}
