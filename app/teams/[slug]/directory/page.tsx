'use client'

import useSWR from 'swr'
import { Person } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Props = {
  params: { slug: string }
}

export default function TeamDirectoryPage({ params }: Props) {
  const { data, error } = useSWR<Person[]>(`/api/directory?team=${params.slug}`, fetcher)

  if (error) return <div>Error loading directory</div>
  if (!data) return <div>Loading directory...</div>
  if (data.length === 0) return <div className="text-muted-foreground mt-8 text-center">No members yet.</div>

  return (
    <ul className="space-y-4 mt-4">
      {data.map((person) => (
        <li key={person.id} className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="text-lg font-semibold">{person.firstName} {person.lastName}</div>
          <div className="text-muted-foreground text-sm">{person.company} — {person.location}</div>
        </li>
      ))}
    </ul>
  )
}
