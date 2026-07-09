import { Download, Plus, RefreshCcw } from 'lucide-react'

import type { Discom, SubVertical, Vertical, Zone } from '../../types/hierarchy'
import type { EquipmentFieldConfig } from '../../types/equipment'
import EquipmentSearch from './EquipmentSearch'
import type { Substation } from '../../types/substation'

type EquipmentToolbarProps = {
  title: string
  search: string
  isRefreshing?: boolean
  activeFilter: string
  discomId: string
  zoneId: string
  verticalId: string
  subVerticalId: string
  substationId: string
  discoms: Discom[]
  zones: Zone[]
  verticals: Vertical[]
  subVerticals: SubVertical[]
  substations: Substation[]
  numericFilters?: EquipmentFieldConfig[]
  textFilters?: EquipmentFieldConfig[]
  filterValues: Record<string, string>
  onSearchChange: (value: string) => void
  onActiveFilterChange: (value: string) => void
  onHierarchyChange: (key: 'discomId' | 'zoneId' | 'verticalId' | 'subVerticalId' | 'substationId', value: string) => void
  onFilterValueChange: (key: string, value: string) => void
  onRefresh: () => void
  onExport: () => void
  onCreate: () => void
}

export default function EquipmentToolbar({
  title,
  search,
  isRefreshing,
  activeFilter,
  discomId,
  zoneId,
  verticalId,
  subVerticalId,
  substationId,
  discoms,
  zones,
  verticals,
  subVerticals,
  substations,
  numericFilters = [],
  textFilters = [],
  filterValues,
  onSearchChange,
  onActiveFilterChange,
  onHierarchyChange,
  onFilterValueChange,
  onRefresh,
  onExport,
  onCreate,
}: EquipmentToolbarProps) {
  return (
    <div className="space-y-4 border-b border-slate-200 p-5 dark:border-slate-800">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage equipment records with hierarchy-aware filters and server-side controls.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onRefresh} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
          <button type="button" onClick={onExport} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
          <button type="button" onClick={onCreate} className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <EquipmentSearch value={search} onChange={onSearchChange} placeholder="Search equipment" />
        <select value={activeFilter} onChange={(event) => onActiveFilterChange(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          <option value="all">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={discomId} onChange={(event) => onHierarchyChange('discomId', event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          <option value="">All Discoms</option>
          {discoms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={zoneId} onChange={(event) => onHierarchyChange('zoneId', event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          <option value="">All Zones</option>
          {zones.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={verticalId} onChange={(event) => onHierarchyChange('verticalId', event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          <option value="">All Verticals</option>
          {verticals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={subVerticalId} onChange={(event) => onHierarchyChange('subVerticalId', event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          <option value="">All Sub Verticals</option>
          {subVerticals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={substationId} onChange={(event) => onHierarchyChange('substationId', event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          <option value="">All Substations</option>
          {substations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        {[...numericFilters, ...textFilters].map((filter) => (
          <input
            key={filter.name}
            value={filterValues[filter.name] ?? ''}
            type={filter.type === 'number' ? 'number' : 'text'}
            placeholder={filter.label}
            onChange={(event) => onFilterValueChange(filter.name, event.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        ))}
      </div>
    </div>
  )
}
