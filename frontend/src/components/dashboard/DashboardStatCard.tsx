import type { LucideIcon } from 'lucide-react'

import { cn } from '../../utils/cn'

type TrendTone = 'positive' | 'neutral' | 'warning'

type DashboardStatCardProps = {
  title: string
  value: string | number
  icon: LucideIcon
  trend: string
  trendTone?: TrendTone
  accentClassName?: string
  loading?: boolean
}

const trendToneClasses: Record<TrendTone, string> = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300',
}

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendTone = 'neutral',
  accentClassName = 'bg-blue-600',
  loading = false,
}: DashboardStatCardProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
        <div className="h-1 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-11 w-11 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="mt-4 h-6 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700">
      <div className={cn('h-1 w-16 rounded-full', accentClassName)} />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition group-hover:scale-105 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-4">
        <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', trendToneClasses[trendTone])}>
          {trend}
        </span>
      </div>
    </article>
  )
}
