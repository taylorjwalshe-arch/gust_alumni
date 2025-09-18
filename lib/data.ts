import { prisma } from '@/lib/prisma'

export async function getPeople() {
  return await prisma.person.findMany({
    orderBy: { lastName: 'asc' },
  })
}

export async function getPersonById(id: string) {
  return await prisma.person.findUnique({ where: { id } })
}

export async function getJobs() {
  return await prisma.job.findMany({
    orderBy: { postedAt: 'desc' },
  })
}

export async function getJobById(id: string) {
  return await prisma.job.findUnique({ where: { id } })
}

export async function getFeedPosts() {
  return await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getFilteredPosts(slug: string) {
  return await prisma.post.findMany({
    where: {
      poster: { teamAffiliation: slug },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getMentors() {
  return await prisma.person.findMany({
    where: { role: 'mentor' },
    orderBy: { lastName: 'asc' },
  })
}

export async function getMentorsByTeamSlug(slug: string) {
  return await prisma.person.findMany({
    where: {
      role: 'mentor',
      teamAffiliation: slug,
    },
    orderBy: { lastName: 'asc' },
  })
}

export async function getTeamBySlug(slug: string) {
  return await prisma.team.findUnique({ where: { slug } })
}
