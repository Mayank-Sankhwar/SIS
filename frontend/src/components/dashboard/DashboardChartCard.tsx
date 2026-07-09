import type { ReactNode } from 'react'

import { cn } from '../../utils/cn'

type DashboardChartCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export default function DashboardChartCard({ title, subtitle, children, className }: DashboardChartCardProps) {
  return (
    <section className={cn('rounded-lg border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:shadow-[0_22px_44px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-950', className)}>
      <div className="mb-5">
        <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="h-72">{children}</div>
    </section>
  )
}
