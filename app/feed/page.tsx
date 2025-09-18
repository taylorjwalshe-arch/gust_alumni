'use client'

import { db } from '@/lib/db'
import { useState, useMemo } from 'react'
import { format } from 'date-fns'

const getData = async () => {
  const res = await fetch('/api/feed')
  const data = await res.json()
  return data
}

export default function FeedPage() {
  const [filter, setFilter] = useState<'all' | 'jobs' | 'requests'>('all')
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useState(() => {
    getData().then(data => {
      setPosts(data)
      setLoading(false)
    })
  }, [])

  const filteredPosts = useMemo(() => {
    return posts
      .filter(p => {
        if (filter === 'jobs' && p.isRequest) return false
        if (filter === 'requests' && !p.isRequest) return false
        return true
      })
      .filter(p =>
        [p.title, p.company].some(field =>
          field?.toLowerCase().includes(search.toLowerCase())
        )
      )
  }, [filter, search, posts])

  if (loading) return <p className="p-4 text-sm text-muted-foreground">Loading...</p>

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or company..."
          className="border px-3 py-1 text-sm rounded-md w-64"
        />
        <div className="flex gap-2 text-sm">
          {['all', 'jobs', 'requests'].map(opt => (
            <button
              key={opt}
              className={`px-3 py-1 rounded-md border ${
                filter === opt ? 'bg-primary text-white' : 'bg-white'
              }`}
              onClick={() => setFilter(opt as any)}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <ul className="space-y-4">
        {filteredPosts.map(p => (
          <li key={p.id} className="border p-4 rounded-md shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.company} — {p.location}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(p.postedAt), 'MMM dd, yyyy')}
              </p>
            </div>
            {p.isRequest && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Request</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
