'use client'

import { formatDistanceToNow } from 'date-fns'

export default function FeedPostDate({ date }: { date: Date }) {
  return (
    <p className="text-sm text-muted-foreground">
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </p>
  )
}
