import { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.slug} – Team Profile`,
  }
}

export default function TeamProfilePage() {
  return (
    <div className="max-w-2xl mx-auto mt-12">
      <Card>
        <CardContent>
          <h2 className="text-2xl font-semibold mb-4">Team Profile</h2>
          <p>This is a placeholder for the team profile page. Content will be added in future tickets.</p>
        </CardContent>
      </Card>
    </div>
  )
}
