import './globals.css'
import { ToasterProvider } from '@/components/ToasterProvider'
import { getServerAuthSession } from '@/lib/authLoose'
import { SessionProvider } from 'next-auth/react'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession()

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <ToasterProvider />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
