import './globals.css'
import { Inter } from 'next/font/google'
import { ToasterProvider } from '@/components/ToasterProvider'
import { getServerAuthSession } from '@/lib/authLoose'
import { SessionProvider } from 'next-auth/react'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'GUST',
  description: 'Georgetown University Sailing Team',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession()

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ToasterProvider />
          <Navbar />
          <main className="p-4 max-w-4xl mx-auto">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
