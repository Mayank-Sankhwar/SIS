import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: LucideIcon
}

export default function EmptyState({ title, description, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
        {description ? <p className="mx-auto mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
    </div>
  )
}
