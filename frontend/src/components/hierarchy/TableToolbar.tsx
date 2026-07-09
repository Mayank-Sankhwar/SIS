import { Download, Plus, RefreshCcw } from 'lucide-react'

import type { ActiveFilter, Discom, Vertical, Zone } from '../../types/hierarchy'
import SearchBox from './SearchBox'

type TableToolbarProps = {
  title: string
  search: string
  onSearchChange: (value: string) => void
  activeFilter?: ActiveFilter
  onActiveFilterChange?: (value: ActiveFilter) => void
  discomId?: string
  zoneId?: string
  verticalId?: string
  discoms?: Discom[]
  zones?: Zone[]
  verticals?: Vertical[]
  onDiscomChange?: (value: string) => void
  onZoneChange?: (value: string) => void
  onVerticalChange?: (value: string) => void
  onRefresh: () => void
  onCreate: () => void
  onExport: () => void
  isRefreshing?: boolean
}

export default function TableToolbar({
  title,
  search,
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
  discomId,
  zoneId,
  verticalId,
  discoms = [],
  zones = [],
  verticals = [],
  onDiscomChange,
  onZoneChange,
  onVerticalChange,
  onRefresh,
  onCreate,
  onExport,
  isRefreshing = false,
}: TableToolbarProps) {
  return (
    <div className="space-y-4 border-b border-slate-200 p-5 dark:border-slate-800">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage hierarchy master data from a single enterprise table.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SearchBox value={search} onChange={onSearchChange} placeholder="Search name or code" />

        {onActiveFilterChange ? (
          <select
            value={activeFilter}
            onChange={(event) => onActiveFilterChange(event.target.value as ActiveFilter)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            aria-label="Status filter"
          >
            <option value="all">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        ) : null}

        {onDiscomChange ? (
          <select
            value={discomId ?? ''}
            onChange={(event) => onDiscomChange(event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            aria-label="Discom filter"
          >
            <option value="">All Discoms</option>
            {discoms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : null}

        {onZoneChange ? (
          <select
            value={zoneId ?? ''}
            onChange={(event) => onZoneChange(event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            aria-label="Zone filter"
          >
            <option value="">All Zones</option>
            {zones.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : null}

        {onVerticalChange ? (
          <select
            value={verticalId ?? ''}
            onChange={(event) => onVerticalChange(event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            aria-label="Vertical filter"
          >
            <option value="">All Verticals</option>
            {verticals.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  )
}
