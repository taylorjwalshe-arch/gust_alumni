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

export async function getJobs() {
  return prisma.job.findMany({
    orderBy: { postedAt: 'desc' },
  })
}

export async function getJobById(id: string) {
  return prisma.job.findUnique({ where: { id } })
}

export async function getFeedPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getFilteredPosts(slug: string) {
  return prisma.post.findMany({
    where: { poster: { teamAffiliation: slug } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getMentors() {
  return prisma.person.findMany({
    where: { role: 'mentor' },
    orderBy: { lastName: 'asc' },
  })
}

export async function getMentorsByTeamSlug(slug: string) {
  return prisma.person.findMany({
    where: { role: 'mentor', teamAffiliation: slug },
    orderBy: { lastName: 'asc' },
  })
}

export async function getTeamBySlug(slug: string) {
  return prisma.team.findUnique({ where: { slug } })
}
