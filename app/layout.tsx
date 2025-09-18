import './globals.css'
import { ToasterProvider } from '@/components/ToasterProvider'
import { auth } from '@/lib/auth'
import { SessionProvider } from 'next-auth/react'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

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
