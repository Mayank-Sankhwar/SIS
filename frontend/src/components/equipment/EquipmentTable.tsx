import { Edit, Eye, Trash2 } from 'lucide-react'

import EmptyState from '../EmptyState/EmptyState'
import ErrorState from '../ErrorState/ErrorState'
import type { EquipmentColumnConfig, EquipmentEntity } from '../../types/equipment'
import EquipmentStatusBadge from './EquipmentStatusBadge'

type EquipmentTableProps = {
  rows: EquipmentEntity[]
  columns: EquipmentColumnConfig[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  loading?: boolean
  error?: boolean
  onSort: (field: string) => void
  onRetry: () => void
  onView: (row: EquipmentEntity) => void
  onEdit: (row: EquipmentEntity) => void
  onDelete: (row: EquipmentEntity) => void
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleDateString('en-IN')
  return String(value)
}

export default function EquipmentTable({ rows, columns, sortBy, sortOrder, loading, error, onSort, onRetry, onView, onEdit, onDelete }: EquipmentTableProps) {
  if (error) {
    return <div className="p-5"><ErrorState title="Unable to load equipment" onRetry={onRetry} /></div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900/70">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {column.sortable ? (
                  <button type="button" onClick={() => onSort(column.key)} className="inline-flex items-center gap-1 transition hover:text-slate-900 dark:hover:text-white">
                    {column.label}
                    {sortBy === column.key ? <span>{sortOrder === 'asc' ? '↑' : '↓'}</span> : null}
                  </button>
                ) : column.label}
              </th>
            ))}
            <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Substation</th>
            <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
            <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
          {loading ? Array.from({ length: 8 }).map((_, index) => (
            <tr key={index}>{Array.from({ length: columns.length + 3 }).map((__, cell) => <td key={cell} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /></td>)}</tr>
          )) : null}
          {!loading && rows.length === 0 ? <tr><td colSpan={columns.length + 3} className="p-5"><EmptyState title="No equipment found" description="Try changing search or filters." /></td></tr> : null}
          {!loading ? rows.map((row) => (
            <tr key={row.id} onClick={() => onView(row)} className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-900/70">
              {columns.map((column) => <td key={column.key} className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{displayValue(row[column.key])}</td>)}
              <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950 dark:text-white">{row.substation?.name ?? '-'}</td>
              <td className="whitespace-nowrap px-5 py-4"><EquipmentStatusBadge isActive={row.isActive} /></td>
              <td className="whitespace-nowrap px-5 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                <div className="inline-flex items-center gap-2">
                  <button type="button" onClick={() => onView(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900" aria-label="View"><Eye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onEdit(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900" aria-label="Edit"><Edit className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onDelete(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/30" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          )) : null}
        </tbody>
      </table>
    </div>
  )
}
