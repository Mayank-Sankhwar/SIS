import { Download, FileJson, FileSpreadsheet, FileText, Printer } from 'lucide-react'

import type { ReportFormat } from '../../types/reports'
import { cn } from '../../utils/cn'

type ReportExportButtonsProps = {
  disabled: boolean
  exportingFormat: ReportFormat | null
  onExport: (format: ReportFormat) => void
  onPrint: () => void
}

const exportButtons: Array<{ format: ReportFormat; label: string; icon: typeof FileJson }> = [
  { format: 'json', label: 'JSON', icon: FileJson },
  { format: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
  { format: 'pdf', label: 'PDF', icon: FileText },
]

export default function ReportExportButtons({ disabled, exportingFormat, onExport, onPrint }: ReportExportButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {exportButtons.map((button) => {
        const Icon = button.icon
        const isLoading = exportingFormat === button.format

        return (
          <button
            key={button.format}
            type="button"
            onClick={() => onExport(button.format)}
            disabled={disabled}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-900 dark:hover:bg-blue-950/30 dark:hover:text-blue-200',
              isLoading && 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40',
            )}
          >
            {isLoading ? <Download className="h-4 w-4 animate-pulse" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
            {button.label}
          </button>
        )
      })}
      <button
        type="button"
        onClick={onPrint}
        disabled={disabled}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
        Print
      </button>
    </div>
  )
}
