import type { LucideIcon } from 'lucide-react'

import { cn } from '../../utils/cn'

type ReportCategoryCardProps = {
  title: string
  description: string
  icon: LucideIcon
  active: boolean
  accent: string
  onClick: () => void
}

export default function ReportCategoryCard({ title, description, icon: Icon, active, accent, onClick }: ReportCategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group min-h-36 rounded-lg border bg-white p-5 text-left shadow-[0_14px_36px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(15,23,42,0.1)] dark:bg-slate-950',
        active ? 'border-blue-500 ring-2 ring-blue-100 dark:border-blue-400 dark:ring-blue-950' : 'border-slate-200 dark:border-slate-800',
      )}
      aria-pressed={active}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-lg text-white shadow-sm', accent)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full transition',
            active ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-300 group-hover:bg-slate-500 dark:bg-slate-700',
          )}
        />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </button>
  )
}
