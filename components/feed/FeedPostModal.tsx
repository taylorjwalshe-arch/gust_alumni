'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'

export default function FeedPostModal() {
  const [content, setContent] = useState('')
  const { data: session } = useSession()

  const handleSubmit = async () => {
    if (!content.trim()) return
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    window.location.reload()
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-5 py-2 shadow-md hover:bg-blue-700">
          Post
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-zinc-950 p-4 flex flex-col gap-4 border border-border max-h-[90vh] overflow-hidden">
          <Dialog.Title className="text-lg font-medium">Create Post</Dialog.Title>
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] resize-none flex-1"
          />
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
            <div className="pl-1">
              {session?.user && (
                <Avatar name={session.user.name || 'User'} className="h-8 w-8" />
              )}
            </div>
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button onClick={handleSubmit}>Post</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
