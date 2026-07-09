import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

import type { ImportValidationResponse } from '../../types/imports'

type ValidationResultCardProps = {
  result: ImportValidationResponse | null
}

export default function ValidationResultCard({ result }: ValidationResultCardProps) {
  if (!result) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">Validation Results</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No validation result is available yet.</p>
      </section>
    )
  }

  const missingSheets = result.workbookSummary.requiredSheetCount - result.workbookSummary.sheetCount
  const missingColumns = result.sheets.reduce((total, sheet) => total + sheet.missingColumns.length, 0)
  const extraColumns = result.sheets.reduce((total, sheet) => total + sheet.extraColumns.length, 0)
  const invalidHeaderOrder = result.sheets.filter((sheet) => !sheet.headerOrderValid).length
  const corrupted = result.validationErrors.some((error) => error.errorCode === 'CORRUPTED_WORKBOOK' || error.errorCode === 'EMPTY_FILE')

  const cards = [
    { title: 'Validation Warnings', value: result.validationWarnings.length, tone: 'amber', icon: Info },
    { title: 'Validation Errors', value: result.validationErrors.length, tone: 'red', icon: AlertTriangle },
    { title: 'Missing Sheets', value: Math.max(0, missingSheets), tone: 'red', icon: AlertTriangle },
    { title: 'Missing Columns', value: missingColumns, tone: 'red', icon: AlertTriangle },
    { title: 'Extra Columns', value: extraColumns, tone: 'amber', icon: Info },
    { title: 'Invalid Header Order', value: invalidHeaderOrder, tone: 'red', icon: AlertTriangle },
    { title: 'Corrupted Workbook', value: corrupted ? 'Yes' : 'No', tone: corrupted ? 'red' : 'emerald', icon: corrupted ? AlertTriangle : CheckCircle2 },
  ] as const

  const toneClass = {
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300',
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">Validation Results</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className={`rounded-lg border p-4 ${toneClass[card.tone]}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide">{card.title}</p>
              <p className="mt-1 text-2xl font-semibold">{card.value}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
