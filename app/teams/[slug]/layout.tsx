import { ReactNode } from 'react'
import { Metadata } from 'next'
import TeamTabs from '@/components/teams/TeamTabs'

type Props = {
  children: ReactNode
  params: { slug: string }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `Team ${params.slug} | Gust`,
    description: `Explore posts, jobs, mentors, and directory for team ${params.slug} on Gust.`,
  }
}

export default function TeamLayout({ children, params }: Props) {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <TeamTabs slug={params.slug} />
      {children}
    </div>
  )
}
