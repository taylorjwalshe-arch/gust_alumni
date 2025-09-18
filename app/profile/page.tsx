import { redirect } from 'next/navigation'
import { getServerAuthSession } from '@/lib/authLoose'
import { prisma } from '@/lib/db'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const session = await getServerAuthSession()

  if (!session) redirect('/api/auth/signin')

  const existing = await prisma.person.findUnique({
    where: { userId: session.user.id },
  })

  if (existing) redirect(`/profile/${existing.id}`)

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Set up your profile</h1>
      <ProfileForm user={session.user} />
    </div>
  )
}
