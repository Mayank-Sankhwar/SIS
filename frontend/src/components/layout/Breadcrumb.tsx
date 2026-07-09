import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { cn } from '../../utils/cn'
import { breadcrumbLabels } from './navigation'

function formatSegment(segment: string) {
  return breadcrumbLabels[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function Breadcrumb({ className }: { className?: string }) {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm text-slate-500 dark:text-slate-400', className)}>
        <span className="inline-flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
          <Home className="h-4 w-4" aria-hidden="true" />
          Home
        </span>
      </nav>
    )
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex min-w-0 items-center text-sm text-slate-500 dark:text-slate-400', className)}>
      <Link
        to="/"
        className="inline-flex shrink-0 items-center gap-2 rounded-md font-medium text-slate-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:text-blue-300"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        Home
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1

        return (
          <span key={href} className="inline-flex min-w-0 items-center">
            <ChevronRight className="mx-2 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            {isLast ? (
              <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{formatSegment(segment)}</span>
            ) : (
              <Link
                to={href}
                className="truncate rounded-md font-medium text-slate-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:text-blue-300"
              >
                {formatSegment(segment)}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
