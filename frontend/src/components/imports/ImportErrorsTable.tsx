import { Download, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import EmptyState from '../EmptyState/EmptyState'
import Pagination from '../hierarchy/Pagination'
import type { WorkbookValidationIssue } from '../../types/imports'

type ImportErrorsTableProps = {
  errors: WorkbookValidationIssue[]
}

export default function ImportErrorsTable({ errors }: ImportErrorsTableProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const filtered = useMemo(
    () =>
      errors.filter((error) => {
        const haystack = `${error.sheetName ?? ''} ${error.rowNumber} ${error.errorCode} ${error.errorMessage}`.toLowerCase()
        return haystack.includes(search.toLowerCase())
      }),
    [errors, search],
  )

  const pageRows = filtered.slice((page - 1) * limit, page * limit)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'import-errors.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">Import Errors</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Row-level workbook and import validation errors.</p>
        </div>
        <button type="button" onClick={exportJson} disabled={errors.length === 0} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
          <Download className="h-4 w-4" aria-hidden="true" />
          Export JSON
        </button>
      </div>
      <div className="p-5">
        <label className="relative block max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search errors" className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
        </label>
      </div>
      {filtered.length === 0 ? (
        <div className="p-5 pt-0">
          <EmptyState title="No errors" description="No import errors are available for the current result." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/70">
              <tr>
                {['Row', 'Sheet', 'Error Code', 'Message'].map((header) => (
                  <th key={header} className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pageRows.map((error, index) => (
                <tr key={`${error.sheetName}-${error.rowNumber}-${error.errorCode}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">{error.rowNumber}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{error.sheetName ?? '-'}</td>
                  <td className="whitespace-nowrap px-5 py-4"><span className="rounded bg-red-50 px-2 py-1 font-mono text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error.errorCode}</span></td>
                  <td className="min-w-[22rem] px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{error.errorMessage}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} limit={limit} total={filtered.length} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1) }} />
        </div>
      )}
    </section>
  )
}
