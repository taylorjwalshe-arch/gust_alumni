import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const team = searchParams.get('team')

  const people = await prisma.person.findMany({
    where: {
      role: 'MEMBER',
      ...(team ? { teamAffiliation: team } : {}),
    },
    orderBy: { lastName: 'asc' },
  })

  return NextResponse.json(people)
}
