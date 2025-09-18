'use client'

import useSWR from 'swr'
import { Job } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Props = {
  params: { slug: string }
}

export default function TeamJobsPage({ params }: Props) {
  const { data, error } = useSWR<Job[]>(`/api/jobs?team=${params.slug}`, fetcher)

  if (error) return <div>Error loading jobs</div>
  if (!data) return <div>Loading jobs...</div>
  if (data.length === 0) return <div className="text-muted-foreground mt-8 text-center">No jobs found.</div>

  return (
    <ul className="space-y-4 mt-4">
      {data.map((job) => (
        <li key={job.id} className="border rounded-lg p-4 shadow-sm bg-white">
          <div className="text-lg font-semibold">{job.title}</div>
          <div className="text-muted-foreground text-sm">{job.company} — {job.location}</div>
        </li>
      ))}
    </ul>
  )
}
