'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="p-4 border-b mb-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">GUST</Link>
      <div className="flex gap-4">
        <Link href="/directory">Directory</Link>
        <Link href="/feed">Feed</Link>
        <Link href="/jobs">Jobs</Link>
        <Link href="/mentors">Mentors</Link>
      </div>
    </nav>
  )
}
