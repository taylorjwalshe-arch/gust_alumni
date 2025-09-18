import { TEAM_CONFIGS } from '@/lib/teams'

export function TeamBanner({ slug }: { slug: string }) {
  const team = TEAM_CONFIGS[slug]
  if (!team?.image) return null

  return (
    <div className="w-full h-36 rounded-xl overflow-hidden border border-gray-300">
      <img
        src={team.image}
        alt={`${slug} banner`}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
