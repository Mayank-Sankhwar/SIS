import { ArrowDown, ArrowUp, Edit, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import EmptyState from '../EmptyState/EmptyState'
import ErrorState from '../ErrorState/ErrorState'
import type { HierarchySortBy, SortOrder } from '../../types/hierarchy'
import StatusBadge from './StatusBadge'

export type EntityTableColumn<T> = {
  key: string
  header: string
  sortable?: HierarchySortBy
  render: (item: T) => ReactNode
}

type EntityTableProps<T extends { id: string; name: string; code: string; isActive: boolean; createdAt: string; updatedAt: string }> = {
  items: T[]
  columns: EntityTableColumn<T>[]
  sortBy: HierarchySortBy
  sortOrder: SortOrder
  loading?: boolean
  error?: boolean
  onSort: (sortBy: HierarchySortBy) => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onRetry: () => void
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={columnIndex} className="px-5 py-4">
              <div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function EntityTable<T extends { id: string; name: string; code: string; isActive: boolean; createdAt: string; updatedAt: string }>({
  items,
  columns,
  sortBy,
  sortOrder,
  loading = false,
  error = false,
  onSort,
  onEdit,
  onDelete,
  onRetry,
}: EntityTableProps<T>) {
  if (error) {
    return (
      <div className="p-5">
        <ErrorState title="Unable to load records" description="The hierarchy data request failed." onRetry={onRetry} />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900/70">
          <tr>
            {columns.map((column) => {
              const active = column.sortable === sortBy
              return (
                <th key={column.key} scope="col" className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {column.sortable ? (
                    <button type="button" onClick={() => onSort(column.sortable!)} className="inline-flex items-center gap-1 transition hover:text-slate-900 dark:hover:text-white">
                      {column.header}
                      {active ? (
                        sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
            <th scope="col" className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
          {loading ? <TableSkeleton columns={columns.length + 1} /> : null}
          {!loading && items.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="p-5">
                <EmptyState title="No records found" description="Try changing the search term or filters." />
              </td>
            </tr>
          ) : null}
          {!loading
            ? items.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/70">
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {column.render(item)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/30"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  )
}

export function defaultEntityColumns<T extends { name: string; code: string; isActive: boolean; createdAt: string; updatedAt: string }>(): EntityTableColumn<T>[] {
  return [
    {
      key: 'name',
      header: 'Name',
      sortable: 'name',
      render: (item) => <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span>,
    },
    {
      key: 'code',
      header: 'Code',
      sortable: 'code',
      render: (item) => <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">{item.code}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: 'isActive',
      render: (item) => <StatusBadge isActive={item.isActive} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: 'updatedAt',
      render: (item) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.updatedAt)),
    },
  ]
}
