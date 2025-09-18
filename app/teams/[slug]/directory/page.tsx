import { getTeamDirectory } from '@/lib/data'
import { DirectoryList } from '@/components/directory/DirectoryList'
import { DirectoryFilters } from '@/components/directory/DirectoryFilters'

interface Props {
  params: { slug: string }
  searchParams: { gradYear?: string; industry?: string; location?: string }
}

export default async function TeamDirectoryPage({ params, searchParams }: Props) {
  const allPeople = await getTeamDirectory(params.slug)

  const filteredPeople = allPeople.filter((person) => {
    const matchesGradYear = searchParams.gradYear
      ? String(person.gradYear) === searchParams.gradYear
      : true
    const matchesIndustry = searchParams.industry
      ? person.industries?.includes(searchParams.industry)
      : true
    const matchesLocation = searchParams.location
      ? person.location?.toLowerCase().includes(searchParams.location.toLowerCase())
      : true

    return matchesGradYear && matchesIndustry && matchesLocation
  })

  return (
    <div className="space-y-4">
      <DirectoryFilters people={allPeople} />
      <DirectoryList people={filteredPeople} />
    </div>
  )
}
