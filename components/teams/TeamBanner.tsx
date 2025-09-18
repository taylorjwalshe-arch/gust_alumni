import { TEAM_CONFIGS } from '@/lib/teams'

export function TeamBanner({ slug }: { slug: string }) {
  const team = TEAM_CONFIGS[slug]
  if (!team?.image) return null

  return (
    <div className="w-full h-32 overflow-hidden rounded-xl mb-4">
      <img
        src={team.image}
        alt={`${slug} banner`}
        className="object-cover w-full h-full"
      />
    </div>
  )
}
