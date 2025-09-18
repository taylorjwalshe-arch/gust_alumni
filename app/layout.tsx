import './globals.css'
import { Inter } from 'next/font/google'
import { getServerAuthSession } from '@/lib/authLoose'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'GUST Alumni',
  description: 'Georgetown Sailing Network',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession().catch(() => null)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
