'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function SuggestMentorsButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mentors/suggest')
      const data = await res.json()
      console.log('Suggested mentors:', data)
      alert(`Suggested mentors:\n${data.map((m: any) => `${m.firstName} ${m.lastName} (${m.expertise})`).join('\n')}`)
    } catch (err) {
      console.error('Error fetching suggested mentors', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant="outline">
      {loading ? 'Loading...' : 'Suggest Mentors'}
    </Button>
  )
}
