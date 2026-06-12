import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { DarkModeScript } from '@/components/DarkModeScript'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'Full-stack task management application',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pusherConfig = process.env.PUSHER_KEY
    ? { key: process.env.PUSHER_KEY, cluster: process.env.PUSHER_CLUSTER ?? 'mt1' }
    : null

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <DarkModeScript />
      </head>
      <body className={`${geist.variable} font-sans min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Providers pusherConfig={pusherConfig}>{children}</Providers>
      </body>
    </html>
  )
}
