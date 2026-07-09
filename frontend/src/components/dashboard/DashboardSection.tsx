import type { ReactNode } from 'react'

import { cn } from '../../utils/cn'

type DashboardSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export default function DashboardSection({ title, description, action, children, className }: DashboardSectionProps) {
  return (
    <section className={cn('rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
