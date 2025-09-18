import { prisma } from '@/lib/prisma'
import { DirectoryCard } from '@/components/directory/DirectoryCard'

type Props = {
  params: { slug: string }
}

export default async function TeamDirectoryPage({ params }: Props) {
  const people = await prisma.person.findMany({
    where: {
      role: 'MEMBER',
      teamAffiliation: params.slug,
    },
    orderBy: {
      lastName: 'asc',
    },
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {people.map((person) => (
        <DirectoryCard key={person.id} person={person} />
      ))}
    </div>
  )
}
