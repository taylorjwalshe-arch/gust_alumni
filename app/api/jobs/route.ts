import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const team = searchParams.get('team')

  const jobs = await prisma.job.findMany({
    where: {
      ...(team ? { teamAffiliation: team } : {}),
    },
    orderBy: { postedAt: 'desc' },
  })

  return NextResponse.json(jobs)
}
