import Link from 'next/link'
import { ReactNode } from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'
import { Metadata } from 'next'

type Props = {
  children: ReactNode
  params: { slug: string }
}

const tabs = ['feed', 'directory', 'jobs', 'mentors']

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `Team ${params.slug} | Gust`,
    description: `Explore posts, jobs, mentors, and directory for team ${params.slug} on Gust.`,
  }
}

export default function TeamLayout({ children, params }: Props) {
  const { slug } = params
  const activeSegment = useSelectedLayoutSegment()

  return (
    <div className="p-4 max-w-4xl mx-auto">
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
      {children}
    </div>
  )
}
