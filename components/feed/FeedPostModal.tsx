'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function FeedPostModal({ onPost }: { onPost: (content: string) => void }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    onPost(content)
    setContent('')
    setOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 rounded-full px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 shadow-lg"
      >
        Post
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share an Update</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's going on?"
          />
          <Button className="mt-4 w-full" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
