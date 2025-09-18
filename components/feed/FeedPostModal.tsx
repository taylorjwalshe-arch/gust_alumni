'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface FeedPostModalProps {
  open: boolean
  setOpen: (value: boolean) => void
}

export function FeedPostModal({ open, setOpen }: FeedPostModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to post')

      setContent('')
      setOpen(false)

      // ✅ Refresh feed
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      console.error(err)
      alert('Error posting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <h2 className="text-lg font-medium">New Post</h2>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something..."
          rows={5}
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit} disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
