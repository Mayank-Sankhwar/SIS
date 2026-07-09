import { FileSpreadsheet } from 'lucide-react'

import type { ImportValidationResponse } from '../../types/imports'

type WorkbookSummaryCardProps = {
  result: ImportValidationResponse | null
}

export default function WorkbookSummaryCard({ result }: WorkbookSummaryCardProps) {
  if (!result) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-6 w-6 text-slate-400" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">No validation yet</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Validate a workbook to view sheet and row summary.</p>
          </div>
        </div>
      </section>
    )
  }

  const metrics = [
    ['Sheet Count', result.workbookSummary.sheetCount],
    ['Required Sheets', result.workbookSummary.requiredSheetCount],
    ['Total Rows', result.workbookSummary.totalRows],
    ['Warnings', result.validationWarnings.length],
    ['Errors', result.validationErrors.length],
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">Workbook Summary</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{result.uploadedFile.originalFileName}</p>
        </div>
        <span className={result.isValid ? 'rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300' : 'rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300'}>
          {result.isValid ? 'Valid' : 'Invalid'}
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
