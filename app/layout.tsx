import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'Full-stack task management application',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let isDark = false
  try {
    const auth = await getAuthUser()
    if (auth) {
      const user = await db.user.findUnique({
        where: { id: auth.userId },
        select: { themePreference: true },
      })
      isDark = user?.themePreference === 'dark'
    }
  } catch {}

  const pusherConfig = process.env.PUSHER_KEY
    ? { key: process.env.PUSHER_KEY, cluster: process.env.PUSHER_CLUSTER ?? 'mt1' }
    : null

  return (
    <html lang="en" className={isDark ? 'dark' : undefined} suppressHydrationWarning>
      <body className={`${geist.variable} font-sans min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Providers pusherConfig={pusherConfig} isDark={isDark}>{children}</Providers>
      </body>
    </html>
  )
}
