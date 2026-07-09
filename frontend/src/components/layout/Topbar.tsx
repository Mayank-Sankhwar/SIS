import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/cn'
import Breadcrumb from './Breadcrumb'

type TopbarProps = {
  onOpenMobile: () => void
  onLogout: () => void
}

function getInitials(name?: string) {
  if (!name) {
    return 'U'
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function Topbar({ onOpenMobile, onLogout }: TopbarProps) {
  const { user, role } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobile}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="hidden items-center gap-3 xl:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-700 text-sm font-bold text-white shadow-sm">
              K
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-950 dark:text-white">KESCO</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Substation Information System</p>
            </div>
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-950 sm:text-lg dark:text-white">Enterprise Application</p>
            <Breadcrumb className="mt-0.5 hidden sm:flex" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>

          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
          </button>

          <div className="hidden min-w-0 items-center gap-3 rounded-md border border-slate-200 px-3 py-2 lg:flex dark:border-slate-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white dark:bg-blue-600">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name ?? 'Authenticated User'}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{role ?? user?.role ?? 'User'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500',
            )}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
