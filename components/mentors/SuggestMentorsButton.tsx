'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function SuggestMentorsButton() {
  const router = useRouter()

  return (
    <div className="flex justify-end">
      <Button variant="outline" onClick={() => router.push('/mentors/suggest')}>
        Suggest Mentors
      </Button>
    </div>
  )
}
