import Link from 'next/link'
import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  params: { slug: string }
}

const tabs = ['feed', 'directory', 'jobs', 'mentors']

export default function TeamLayout({ children, params }: Props) {
  const { slug } = params

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex space-x-4 border-b border-muted pb-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={`/teams/${slug}/${tab}`}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Link>
        ))}
      </div>
      {children}
    </div>
  )
}
