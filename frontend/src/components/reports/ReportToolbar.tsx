import { RefreshCcw, Search } from 'lucide-react'

import ReportExportButtons from './ReportExportButtons'
import type { ReportFormat } from '../../types/reports'

type ReportToolbarProps = {
  title: string
  rowCount: number
  search: string
  onSearchChange: (value: string) => void
  isRefreshing: boolean
  onRefresh: () => void
  canExport: boolean
  exportingFormat: ReportFormat | null
  onExport: (format: ReportFormat) => void
  onPrint: () => void
}

export default function ReportToolbar({
  title,
  rowCount,
  search,
  onSearchChange,
  isRefreshing,
  onRefresh,
  canExport,
  exportingFormat,
  onExport,
  onPrint,
}: ReportToolbarProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{rowCount.toLocaleString()} rows available for preview</p>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Search report rows</span>
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search preview"
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
            />
          </label>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <RefreshCcw className={isRefreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
            Refresh
          </button>
          <ReportExportButtons disabled={!canExport} exportingFormat={exportingFormat} onExport={onExport} onPrint={onPrint} />
        </div>
      </div>
    </div>
  )
}
