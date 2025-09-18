'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function DeletePostButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Post deleted')
      router.refresh()
    } else {
      toast.error('Failed to delete')
    }
  }

  return (
    <button onClick={handleDelete} className="text-sm text-red-600 hover:underline">
      <Trash2 className="inline-block w-4 h-4 mr-1" />
      Delete
    </button>
  )
}
