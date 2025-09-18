import { getTeamDirectory } from '@/lib/data'
import { DirectoryList } from '@/components/directory/DirectoryList'

export default async function TeamDirectoryPage({ params }: { params: { slug: string } }) {
  const people = await getTeamDirectory(params.slug)

  if (people.length === 0) {
    return <p className="text-center text-muted-foreground py-16">No team members listed.</p>
  }

  return <DirectoryList people={people} />
}
