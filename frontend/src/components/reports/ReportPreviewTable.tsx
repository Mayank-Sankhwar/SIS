import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useMemo } from 'react'

import EmptyState from '../EmptyState/EmptyState'
import type { ReportRow, ReportSortState } from '../../types/reports'

type ReportPreviewTableProps = {
  rows: ReportRow[]
  search: string
  page: number
  pageSize: number
  sort: ReportSortState
  onPageChange: (page: number) => void
  onSortChange: (sort: ReportSortState) => void
}

function toTitle(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function cellText(value: ReportRow[string]) {
  if (value === null) return ''
  if (typeof value === 'boolean') return value ? 'Active' : 'Inactive'
  return String(value)
}

function displayCell(value: ReportRow[string]) {
  if (typeof value === 'boolean') {
    return (
      <span className={value ? 'inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300'}>
        {value ? 'Active' : 'Inactive'}
      </span>
    )
  }

  if (value === null || value === '') return <span className="text-slate-400">-</span>

  const text = String(value)
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    return new Date(text).toLocaleString()
  }

  return text
}

export default function ReportPreviewTable({ rows, search, page, pageSize, sort, onPageChange, onSortChange }: ReportPreviewTableProps) {
  const columns = useMemo(() => Array.from(rows.reduce((keys, row) => {
    Object.keys(row).forEach((key) => keys.add(key))
    return keys
  }, new Set<string>())), [rows])

  const processedRows = useMemo(() => {
    const searchText = search.trim().toLowerCase()
    const filtered = searchText
      ? rows.filter((row) => Object.values(row).some((value) => cellText(value).toLowerCase().includes(searchText)))
      : rows

    if (!sort.key) return filtered

    return [...filtered].sort((left, right) => {
      const leftValue = cellText(left[sort.key]).toLowerCase()
      const rightValue = cellText(right[sort.key]).toLowerCase()
      const direction = sort.order === 'asc' ? 1 : -1

      return leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: 'base' }) * direction
    })
  }, [rows, search, sort])

  const totalPages = Math.max(Math.ceil(processedRows.length / pageSize), 1)
  const safePage = Math.min(page, totalPages)
  const pagedRows = processedRows.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleSort = (key: string) => {
    onSortChange({
      key,
      order: sort.key === key && sort.order === 'asc' ? 'desc' : 'asc',
    })
  }

  if (rows.length === 0) {
    return <EmptyState title="No report data" description="Try changing filters or choose another report category." />
  }

  if (processedRows.length === 0) {
    return <EmptyState title="No matching rows" description="Clear the preview search to see all returned report rows." />
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/70">
            <tr>
              {columns.map((column) => {
                const SortIcon = sort.key === column ? (sort.order === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown

                return (
                  <th key={column} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    <button type="button" onClick={() => handleSort(column)} className="inline-flex items-center gap-1.5 transition hover:text-blue-700 dark:hover:text-blue-300">
                      {toTitle(column)}
                      <SortIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pagedRows.map((row, index) => (
              <tr key={`${safePage}-${index}`} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/60">
                {columns.map((column) => (
                  <td key={column} className="max-w-72 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                    <div className="truncate" title={cellText(row[column])}>{displayCell(row[column])}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400">
        <span>
          Showing {((safePage - 1) * pageSize + 1).toLocaleString()}-{Math.min(safePage * pageSize, processedRows.length).toLocaleString()} of {processedRows.length.toLocaleString()}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(safePage - 1, 1))}
            disabled={safePage === 1}
            className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Previous
          </button>
          <span className="px-2">Page {safePage} of {totalPages}</span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(safePage + 1, totalPages))}
            disabled={safePage === totalPages}
            className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
