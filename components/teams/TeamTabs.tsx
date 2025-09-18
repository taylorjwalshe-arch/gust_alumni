'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

const tabs = ['feed', 'directory', 'jobs', 'mentors']

export default function TeamTabs({ slug }: { slug: string }) {
  const activeSegment = useSelectedLayoutSegment()

  return (
    <div className="flex space-x-4 border-b border-muted pb-2 mb-6">
      {tabs.map((tab) => {
        const isActive = activeSegment === tab
        return (
          <Link
            key={tab}
            href={`/teams/${slug}/${tab}`}
            className={`text-sm font-medium transition-colors ${
              isActive ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-primary'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Link>
        )
      })}
    </div>
  )
}
