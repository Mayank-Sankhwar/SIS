import type { ReactNode } from 'react'

import Breadcrumb from './Breadcrumb'

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950">
      <Breadcrumb />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h1>
          {description ? <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
