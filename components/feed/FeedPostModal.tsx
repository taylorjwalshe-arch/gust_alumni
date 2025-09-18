'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function FeedPostModal() {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [open, setOpen] = useState(false)

  async function submitPost() {
    if (!content) return

    const res = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })

    if (res.ok) {
      toast.success('Post submitted')
      setContent('')
      setOpen(false)
      router.refresh()
    } else {
      toast.error('Something went wrong')
    }
  }

  if (!session?.user) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="bg-white rounded-lg px-4 py-3 border flex items-center gap-3 shadow cursor-pointer">
          <Avatar src={session.user.image} initials={session.user.name} />
          <span className="text-sm text-muted-foreground">Start a post...</span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-4">
          <Textarea
            placeholder="Write your update..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              className="text-sm px-4 py-2 rounded border"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="text-sm px-4 py-2 rounded bg-black text-white"
              onClick={submitPost}
            >
              Post
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
