import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Building2,
  Boxes,
  Cable,
  Factory,
  FileClock,
  FileText,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react'

import ReportCategoryCard from '../../components/reports/ReportCategoryCard'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportPreviewTable from '../../components/reports/ReportPreviewTable'
import ReportToolbar from '../../components/reports/ReportToolbar'
import { useHierarchyList } from '../../hooks/useHierarchy'
import { useReportExport, useReportPreview } from '../../hooks/useReports'
import { useSubstations } from '../../hooks/useSubstations'
import type { Discom, SubVertical, Vertical, Zone } from '../../types/hierarchy'
import type { ReportCategoryId, ReportFiltersState, ReportFormat, ReportRequestParams, ReportSortState } from '../../types/reports'
import type { Substation } from '../../types/substation'
import { cn } from '../../utils/cn'

const defaultFilters: ReportFiltersState = {
  discomId: '',
  zoneId: '',
  verticalId: '',
  subVerticalId: '',
  substationId: '',
  voltageLevelKv: '',
  isActive: 'all',
  dateFrom: '',
  dateTo: '',
}

const reportCategories = [
  {
    id: 'substations' as const,
    title: 'Substations',
    description: 'Operational overview of substation inventory, status, and voltage.',
    icon: Building2,
    accent: 'bg-slate-900',
  },
  {
    id: 'transformers' as const,
    title: 'Transformers',
    description: 'Transformer portfolio, capacity, and commissioning details.',
    icon: Factory,
    accent: 'bg-blue-700',
  },
  {
    id: 'feeders' as const,
    title: 'Feeders',
    description: 'Outgoing feeder load, connectivity, and service health.',
    icon: Cable,
    accent: 'bg-emerald-700',
  },
  {
    id: 'equipment-summary' as const,
    title: 'Equipment Summary',
    description: 'Hierarchical rollup of all equipment classes.',
    icon: Boxes,
    accent: 'bg-violet-700',
  },
  {
    id: 'import-history' as const,
    title: 'Import History',
    description: 'Review import batches, source files, and completion dates.',
    icon: FileClock,
    accent: 'bg-amber-700',
  },
  {
    id: 'import-errors' as const,
    title: 'Import Errors',
    description: 'Investigate failed rows, validation issues, and exceptions.',
    icon: AlertTriangle,
    accent: 'bg-rose-700',
  },
  {
    id: 'audit-log' as const,
    title: 'Audit Log',
    description: 'Track user activity, changes, and governance events.',
    icon: ShieldCheck,
    accent: 'bg-cyan-700',
  },
]

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategoryId>('substations')
  const [filters, setFilters] = useState<ReportFiltersState>(defaultFilters)
  const [page, setPage] = useState(1)
  const pageSize = 15
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ReportSortState>({ key: '', order: 'asc' })
  const [exportingFormat, setExportingFormat] = useState<ReportFormat | null>(null)

  const requestParams = useMemo<ReportRequestParams>(() => {
    const params: ReportRequestParams = {
      ...(filters.discomId ? { discomId: filters.discomId } : {}),
      ...(filters.zoneId ? { zoneId: filters.zoneId } : {}),
      ...(filters.verticalId ? { verticalId: filters.verticalId } : {}),
      ...(filters.subVerticalId ? { subVerticalId: filters.subVerticalId } : {}),
      ...(filters.substationId ? { substationId: filters.substationId } : {}),
      ...(filters.voltageLevelKv ? { voltageLevelKv: filters.voltageLevelKv } : {}),
      ...(filters.isActive !== 'all' ? { isActive: filters.isActive } : {}),
      ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
      ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    }

    return params
  }, [filters])

  const hierarchyParams = useMemo(() => ({ page: 1, limit: 100, sortBy: 'name' as const, sortOrder: 'asc' as const }), [])

  const discomsQuery = useHierarchyList('discoms', hierarchyParams)
  const zonesQuery = useHierarchyList('zones', { ...hierarchyParams, ...(filters.discomId ? { discomId: filters.discomId } : {}) })
  const verticalsQuery = useHierarchyList('verticals', {
    ...hierarchyParams,
    ...(filters.discomId ? { discomId: filters.discomId } : {}),
    ...(filters.zoneId ? { zoneId: filters.zoneId } : {}),
  })
  const subVerticalsQuery = useHierarchyList('sub-verticals', {
    ...hierarchyParams,
    ...(filters.discomId ? { discomId: filters.discomId } : {}),
    ...(filters.zoneId ? { zoneId: filters.zoneId } : {}),
    ...(filters.verticalId ? { verticalId: filters.verticalId } : {}),
  })
  const substationsQuery = useSubstations({
    page: 1,
    limit: 200,
    sortBy: 'name',
    sortOrder: 'asc',
    ...(filters.discomId ? { discomId: filters.discomId } : {}),
    ...(filters.zoneId ? { zoneId: filters.zoneId } : {}),
    ...(filters.verticalId ? { verticalId: filters.verticalId } : {}),
    ...(filters.subVerticalId ? { subVerticalId: filters.subVerticalId } : {}),
    ...(filters.voltageLevelKv ? { voltageLevelKv: filters.voltageLevelKv } : {}),
    ...(filters.isActive !== 'all' ? { isActive: filters.isActive } : {}),
  })

  const previewQuery = useReportPreview(selectedCategory, requestParams)
  const exportMutation = useReportExport()

  const rows = previewQuery.data ?? []

  const handleCategoryChange = (category: ReportCategoryId) => {
    setSelectedCategory(category)
    setPage(1)
    setSearch('')
    setSort({ key: '', order: 'asc' })
  }

  const handleFiltersChange = (next: ReportFiltersState) => {
    setFilters(next)
    setPage(1)
    setSearch('')
    setSort({ key: '', order: 'asc' })
  }

  const handleResetFilters = () => {
    setFilters(defaultFilters)
    setPage(1)
    setSearch('')
    setSort({ key: '', order: 'asc' })
  }

  const handleExport = (format: ReportFormat) => {
    setExportingFormat(format)
    exportMutation.mutate(
      { category: selectedCategory, format, params: requestParams },
      { onSettled: () => setExportingFormat(null) },
    )
  }

  const handlePrint = () => {
    window.print()
  }

  const selectedTitle = reportCategories.find((category) => category.id === selectedCategory)?.title ?? 'Reports'

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(226,232,240,0.78))] shadow-[0_18px_42px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.88))]">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Government reporting workspace
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Reports</h1>
              <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                Access structured operational reports for substations, transformers, feeders, imports, and governance activity across the network.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Current view</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedTitle}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Report categories</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a report family to load the matching preview and export actions.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reportCategories.map((category) => (
              <ReportCategoryCard
                key={category.id}
                title={category.title}
                description={category.description}
                icon={category.icon}
                active={category.id === selectedCategory}
                accent={category.accent}
                onClick={() => handleCategoryChange(category.id)}
              />
            ))}
          </div>
        </section>

        <ReportFilters
          value={filters}
          discoms={(discomsQuery.data?.items ?? []) as Discom[]}
          zones={(zonesQuery.data?.items ?? []) as Zone[]}
          verticals={(verticalsQuery.data?.items ?? []) as Vertical[]}
          subVerticals={(subVerticalsQuery.data?.items ?? []) as SubVertical[]}
          substations={(substationsQuery.data?.data ?? []) as Substation[]}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Preview</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Inspect a live preview and export the current selection in JSON, Excel, or PDF format.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              {previewQuery.isFetching ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
                  <RefreshCcw className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Refreshing preview
                </span>
              ) : null}
            </div>
          </div>

          <ReportToolbar
            title={selectedTitle}
            rowCount={rows.length}
            search={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            isRefreshing={previewQuery.isFetching}
            onRefresh={() => void previewQuery.refetch()}
            canExport={rows.length > 0 && !previewQuery.isLoading}
            exportingFormat={exportingFormat}
            onExport={handleExport}
            onPrint={handlePrint}
          />

          <div className={cn('mt-4', previewQuery.isLoading && !previewQuery.data ? 'space-y-3' : '')}>
            {previewQuery.isLoading && !previewQuery.data ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
                <div>
                  <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-blue-100 dark:bg-blue-950/40" />
                  <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">Loading report preview</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fetching the latest report rows from the backend.</p>
                </div>
              </div>
            ) : null}

            {previewQuery.isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/70 dark:bg-red-950/30">
                <h3 className="text-base font-semibold text-slate-950 dark:text-white">Unable to load this report</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  The backend report endpoint returned an error. Please verify the filter values or retry the request.
                </p>
                <button
                  type="button"
                  onClick={() => void previewQuery.refetch()}
                  className="mt-4 inline-flex items-center justify-center rounded-md bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Retry
                </button>
              </div>
            ) : null}

            {!previewQuery.isLoading && !previewQuery.isError ? (
              <ReportPreviewTable
                rows={rows}
                search={search}
                page={page}
                pageSize={pageSize}
                sort={sort}
                onPageChange={setPage}
                onSortChange={setSort}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
