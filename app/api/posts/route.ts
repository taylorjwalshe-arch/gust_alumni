import { NextResponse } from 'next/server'
import { getServerAuthSession } from '@/lib/authLoose'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { content } = body

  if (!content || content.length > 1000) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      content,
      posterId: session.user.id,
    },
  })

  return NextResponse.json({ post })
}
