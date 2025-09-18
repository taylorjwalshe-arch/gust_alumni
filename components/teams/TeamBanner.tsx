'use client'

export default function TeamBanner({ slug }: { slug: string }) {
  return (
    <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-4 rounded-b-lg shadow">
      Team {slug}
    </div>
  )
}
