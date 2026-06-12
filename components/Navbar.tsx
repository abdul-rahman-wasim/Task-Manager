'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleDark } = useAppStore()

  // Sync dark class to html element
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('dark', isDark)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">TaskManager</span>
          {user?.role === 'ADMIN' && <Badge color="purple">Admin</Badge>}
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </span>
          )}
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <Button variant="secondary" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
