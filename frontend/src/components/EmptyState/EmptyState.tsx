import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: LucideIcon
}

export default function EmptyState({ title, description, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-400">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
        {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
    </div>
  )
}
