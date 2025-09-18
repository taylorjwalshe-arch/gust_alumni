'use client'

import useSWR from 'swr'
import { Person } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Props = {
  params: { slug: string }
}

export default function TeamMentorsPage({ params }: Props) {
  const { data, error } = useSWR<Person[]>(`/api/mentors?team=${params.slug}`, fetcher)

  if (error) return <div>Error loading mentors</div>
  if (!data) return <div>Loading mentors...</div>
  if (data.length === 0) return <div className="text-muted-foreground mt-8 text-center">No mentors yet.</div>

  return (
    <ul className="space-y-4 mt-4">
      {data.map((mentor) => (
        <li key={mentor.id} className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="text-lg font-semibold">{mentor.firstName} {mentor.lastName}</div>
          <div className="text-muted-foreground text-sm">{mentor.company} — {mentor.location}</div>
        </li>
      ))}
    </ul>
  )
}
