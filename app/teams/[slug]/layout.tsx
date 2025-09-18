'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { TEAM_CONFIGS } from '@/lib/teams'
import { TeamBanner } from '@/components/teams/TeamBanner'

export default function TeamLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { slug: string }
}) {
  const team = TEAM_CONFIGS[params.slug]
  const navStyle = team?.nav || 'bg-gray-800 text-white'
  const segment = useSelectedLayoutSegment()

  const tabs = [
    { label: 'Directory', href: 'directory' },
    { label: 'Feed', href: 'feed' },
    { label: 'Jobs', href: 'jobs' },
    { label: 'Mentors', href: 'mentors' },
  ]

  return (
    <div className="space-y-4">
      <TeamBanner slug={params.slug} />

      <nav className={`flex gap-6 text-sm font-semibold px-6 py-3 rounded-lg shadow ${navStyle}`}>
        {tabs.map((tab) => {
          const isActive = segment === tab.href
          return (
            <Link
              key={tab.href}
              href={`/teams/${params.slug}/${tab.href}`}
              className={isActive ? 'underline underline-offset-4' : 'opacity-70 hover:opacity-100'}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <div className="bg-white shadow-sm border rounded-xl p-4">
        {children}
      </div>
    </div>
  )
}
