import { prisma } from '@/lib/prisma'

export async function getTeamDirectory(slug: string) {
  return prisma.person.findMany({
    where: { teamAffiliation: { equals: slug, mode: 'insensitive' } },
    orderBy: { lastName: 'asc' },
  })
}

export async function getTeamFeed(slug: string) {
  return prisma.post.findMany({
    where: { teamSlug: { equals: slug, mode: 'insensitive' } },
    include: { author: true },
    orderBy: { postedAt: 'desc' },
  })
}

export async function getTeamJobs(slug: string) {
  return prisma.job.findMany({
    where: { teamSlug: { equals: slug, mode: 'insensitive' } },
    orderBy: { postedAt: 'desc' },
  })
}

export async function getTeamMentors(slug: string) {
  return prisma.mentor.findMany({
    where: { teamSlug: { equals: slug, mode: 'insensitive' } },
    orderBy: { lastName: 'asc' },
  })
}
