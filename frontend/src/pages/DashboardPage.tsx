import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Building2,
  Cable,
  CircleGauge,
  Factory,
  FileSpreadsheet,
  FileText,
  Landmark,
  Layers3,
  LayoutDashboard,
  MapPin,
  Plus,
  RadioTower,
  RefreshCcw,
  Server,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import DashboardChartCard from '../components/dashboard/DashboardChartCard'
import DashboardSection from '../components/dashboard/DashboardSection'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton'
import DashboardStatCard from '../components/dashboard/DashboardStatCard'
import QuickActionCard from '../components/dashboard/QuickActionCard'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import {
  useDashboardMap,
  useDashboardSummary,
  useEquipmentDistribution,
  useEquipmentSummary,
  useFeederLoad,
  useHierarchySummary,
  useImportHistory,
  useRecentImportErrors,
  useSubstationStatus,
  useTransformerCapacity,
} from '../hooks/useDashboard'
import type {
  DashboardEntity,
  DashboardFilterKey,
  DashboardFilters,
  DashboardMapMarker,
  EquipmentCounts,
  EquipmentDistribution,
  FeederLoad,
  SubstationStatus,
  TransformerCapacity,
} from '../types/dashboard'

type StatTrendTone = 'positive' | 'neutral' | 'warning'

type FilterSelectProps = {
  label: string
  value: string
  options: DashboardEntity[]
  onChange: (value: string) => void
}

type ChartDatum = {
  name: string
  value: number
}

const chartColors = ['#1d4ed8', '#0f766e', '#475569', '#b45309', '#6d28d9', '#0369a1']
const statusColors = ['#047857', '#b45309']

const quickActions = [
  { title: 'Add Substation', description: 'Open the substation creation workflow.', icon: Plus },
  { title: 'Upload Excel', description: 'Prepare a workbook import for validation.', icon: FileSpreadsheet },
  { title: 'Generate Report', description: 'Create an operational summary report.', icon: FileText },
  { title: 'Manage Users', description: 'Review access and user assignments.', icon: Users },
  { title: 'View Dashboard', description: 'Return to the enterprise overview.', icon: LayoutDashboard },
]

function equipmentTotal(counts: EquipmentCounts) {
  return (
    counts.incomingSources +
    counts.outgoingFeeders +
    counts.transformers +
    counts.lightningArresters +
    counts.batteryBanks +
    counts.capacitorBanks
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function activeTrend(active: number, inactive: number): { label: string; tone: StatTrendTone } {
  const total = active + inactive
  if (total === 0) {
    return { label: 'No records', tone: 'neutral' }
  }

  const percentage = Math.round((active / total) * 100)
  return {
    label: `${percentage}% active`,
    tone: percentage >= 90 ? 'positive' : percentage >= 70 ? 'warning' : 'neutral',
  }
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function uniqueEntities(items: DashboardEntity[]) {
  return Array.from(new globalThis.Map(items.map((item) => [item.id, item])).values()).sort((left, right) => left.name.localeCompare(right.name))
}

function selectedEquipmentRollups(distribution: EquipmentDistribution | undefined, filters: DashboardFilters) {
  if (!distribution) return []
  if (filters.subVerticalId || filters.substationId) return distribution.bySubVertical
  if (filters.verticalId) return distribution.bySubVertical
  if (filters.zoneId) return distribution.byVertical
  if (filters.discomId) return distribution.byZone
  return distribution.byDiscom
}

function selectedTransformerRollups(transformerCapacity: TransformerCapacity | undefined, filters: DashboardFilters) {
  if (!transformerCapacity) return []
  if (filters.subVerticalId || filters.substationId) return transformerCapacity.bySubVertical
  if (filters.verticalId) return transformerCapacity.bySubVertical
  if (filters.zoneId) return transformerCapacity.byVertical
  if (filters.discomId) return transformerCapacity.byZone
  return transformerCapacity.byDiscom
}

function selectedFeederRollups(feederLoad: FeederLoad | undefined, filters: DashboardFilters) {
  if (!feederLoad) return []
  if (filters.subVerticalId || filters.substationId) return feederLoad.bySubVertical
  if (filters.verticalId) return feederLoad.bySubVertical
  if (filters.zoneId) return feederLoad.byVertical
  if (filters.discomId) return feederLoad.byZone
  return feederLoad.byDiscom
}

function selectedStatusRollups(status: SubstationStatus | undefined, filters: DashboardFilters) {
  if (!status) return []
  if (filters.zoneId || filters.verticalId || filters.subVerticalId || filters.substationId) return status.byVertical
  if (filters.discomId) return status.byZone
  return status.byDiscom
}

function DashboardMapPanel({ markers }: { markers: DashboardMapMarker[] }) {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId) ?? null

  const bounds = useMemo(() => {
    if (markers.length === 0) {
      return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 }
    }

    const latitudes = markers.map((marker) => marker.latitude)
    const longitudes = markers.map((marker) => marker.longitude)
    return {
      minLat: Math.min(...latitudes),
      maxLat: Math.max(...latitudes),
      minLng: Math.min(...longitudes),
      maxLng: Math.max(...longitudes),
    }
  }, [markers])

  if (markers.length === 0) {
    return <EmptyState title="No map markers found" description="No active substations with coordinates are available for the selected filters." icon={MapPin} />
  }

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(226,232,240,0.78))] dark:border-slate-800 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.82))]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:48px_48px]" />
      {markers.map((marker) => {
        const left = bounds.maxLng === bounds.minLng ? 50 : ((marker.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 82 + 9
        const top = bounds.maxLat === bounds.minLat ? 50 : (1 - (marker.latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 72 + 14

        return (
          <button
            key={marker.id}
            type="button"
            onClick={() => setSelectedMarkerId(marker.id)}
            className="absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-blue-700 text-white shadow-[0_10px_22px_rgba(29,78,216,0.32)] transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ left: `${left}%`, top: `${top}%` }}
            aria-label={`View ${marker.name}`}
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </button>
        )
      })}

      <div className="absolute left-5 top-5 z-20 rounded-lg border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">Substation GIS Map</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{markers.length} active markers</p>
      </div>

      {selectedMarker ? (
        <div className="absolute bottom-5 right-5 z-20 w-[min(22rem,calc(100%-2.5rem))] rounded-lg border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-950 dark:text-white">{selectedMarker.name}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedMarker.zone.name}</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
              Active
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
              <dt className="text-slate-500 dark:text-slate-400">Voltage</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{selectedMarker.voltage} kV</dd>
            </div>
            <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
              <dt className="text-slate-500 dark:text-slate-400">Equipment</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{equipmentTotal(selectedMarker.equipmentCounts)}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  )
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({})
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>(() => formatDateTime(new Date().toISOString()))

  const summaryQuery = useDashboardSummary(filters)
  const equipmentSummaryQuery = useEquipmentSummary(filters)
  const hierarchySummaryQuery = useHierarchySummary(filters)
  const equipmentDistributionQuery = useEquipmentDistribution(filters)
  const substationStatusQuery = useSubstationStatus(filters)
  const transformerCapacityQuery = useTransformerCapacity(filters)
  const feederLoadQuery = useFeederLoad(filters)
  const importHistoryQuery = useImportHistory(filters)
  const recentImportErrorsQuery = useRecentImportErrors(filters)
  const mapQuery = useDashboardMap(filters)

  const queries = [
    summaryQuery,
    equipmentSummaryQuery,
    hierarchySummaryQuery,
    equipmentDistributionQuery,
    substationStatusQuery,
    transformerCapacityQuery,
    feederLoadQuery,
    importHistoryQuery,
    recentImportErrorsQuery,
    mapQuery,
  ] as const

  const isInitialLoading = queries.some((query) => query.isLoading)
  const isRefreshing = queries.some((query) => query.isFetching) && !isInitialLoading
  const hasError = queries.some((query) => query.isError)

  useEffect(() => {
    setLastUpdatedAt(formatDateTime(new Date().toISOString()))
  }, [filters, isRefreshing])

  const updateFilter = (key: DashboardFilterKey, value: string) => {
    setFilters((current) => {
      const next: DashboardFilters = { ...current, [key]: value || undefined }

      if (key === 'discomId') {
        next.zoneId = undefined
        next.verticalId = undefined
        next.subVerticalId = undefined
        next.substationId = undefined
      }
      if (key === 'zoneId') {
        next.verticalId = undefined
        next.subVerticalId = undefined
        next.substationId = undefined
      }
      if (key === 'verticalId') {
        next.subVerticalId = undefined
        next.substationId = undefined
      }
      if (key === 'subVerticalId') {
        next.substationId = undefined
      }

      return Object.fromEntries(Object.entries(next).filter((entry) => Boolean(entry[1]))) as DashboardFilters
    })
  }

  const retryAll = () => {
    setLastUpdatedAt(formatDateTime(new Date().toISOString()))
    void Promise.all(queries.map((query) => query.refetch()))
  }

  const filterOptions = useMemo(() => {
    const distribution = equipmentDistributionQuery.data
    const markers = mapQuery.data ?? []

    return {
      discoms: hierarchySummaryQuery.data?.discoms ?? [],
      zones: distribution?.byZone ?? [],
      verticals: distribution?.byVertical ?? [],
      subVerticals: distribution?.bySubVertical ?? [],
      substations: uniqueEntities(markers.map((marker) => ({ id: marker.id, name: marker.name, code: marker.id }))),
    }
  }, [equipmentDistributionQuery.data, hierarchySummaryQuery.data, mapQuery.data])

  const equipmentChartData = useMemo<ChartDatum[]>(() => {
    const rollups = selectedEquipmentRollups(equipmentDistributionQuery.data, filters)
    const totals = rollups.reduce(
      (accumulator, item) => ({
        incomingSources: accumulator.incomingSources + item.value.incomingSources,
        outgoingFeeders: accumulator.outgoingFeeders + item.value.outgoingFeeders,
        transformers: accumulator.transformers + item.value.transformers,
        lightningArresters: accumulator.lightningArresters + item.value.lightningArresters,
        batteryBanks: accumulator.batteryBanks + item.value.batteryBanks,
        capacitorBanks: accumulator.capacitorBanks + item.value.capacitorBanks,
      }),
      { incomingSources: 0, outgoingFeeders: 0, transformers: 0, lightningArresters: 0, batteryBanks: 0, capacitorBanks: 0 },
    )

    return [
      { name: 'Incoming Sources', value: totals.incomingSources },
      { name: 'Outgoing Feeders', value: totals.outgoingFeeders },
      { name: 'Transformers', value: totals.transformers },
      { name: 'Lightning Arresters', value: totals.lightningArresters },
      { name: 'Battery Banks', value: totals.batteryBanks },
      { name: 'Capacitor Banks', value: totals.capacitorBanks },
    ].filter((item) => item.value > 0)
  }, [equipmentDistributionQuery.data, filters])

  const hierarchyChartData = useMemo(() => {
    const rollups = selectedEquipmentRollups(equipmentDistributionQuery.data, filters)
    return rollups.map((item) => ({ name: item.name, count: equipmentTotal(item.value) })).slice(0, 10)
  }, [equipmentDistributionQuery.data, filters])

  const transformerChartData = useMemo(
    () => selectedTransformerRollups(transformerCapacityQuery.data, filters).map((item) => ({ name: item.name, capacity: Math.round(item.totalMva * 100) / 100 })).slice(0, 10),
    [filters, transformerCapacityQuery.data],
  )

  const feederChartData = useMemo(
    () => selectedFeederRollups(feederLoadQuery.data, filters).map((item) => ({ name: item.name, load: Math.round(item.totalConnectedLoadMw * 100) / 100 })).slice(0, 10),
    [feederLoadQuery.data, filters],
  )

  const statusChartData = useMemo<ChartDatum[]>(() => {
    const rollups = selectedStatusRollups(substationStatusQuery.data, filters)
    const active = rollups.reduce((total, item) => total + item.value.active, 0)
    const inactive = rollups.reduce((total, item) => total + item.value.inactive, 0)
    return [
      { name: 'Active', value: active },
      { name: 'Inactive', value: inactive },
    ].filter((item) => item.value > 0)
  }, [filters, substationStatusQuery.data])

  const statCards = useMemo(() => {
    const summary = summaryQuery.data
    const substationTrend = activeTrend(summary?.activeSubstations ?? 0, summary?.inactiveSubstations ?? 0)
    const equipmentTrend = activeTrend(summary?.activeEquipment ?? 0, summary?.inactiveEquipment ?? 0)

    return [
      { title: 'Total Discoms', value: summary?.totalDiscoms ?? 0, icon: Landmark, trend: `${filterOptions.discoms.length} accessible`, tone: 'neutral' as const, accent: 'bg-blue-700' },
      { title: 'Total Zones', value: summary?.totalZones ?? 0, icon: Building2, trend: `${filterOptions.zones.length} in view`, tone: 'neutral' as const, accent: 'bg-cyan-700' },
      { title: 'Total Verticals', value: summary?.totalVerticals ?? 0, icon: Layers3, trend: `${filterOptions.verticals.length} in view`, tone: 'neutral' as const, accent: 'bg-slate-700' },
      { title: 'Total Sub Verticals', value: summary?.totalSubVerticals ?? 0, icon: Users, trend: `${filterOptions.subVerticals.length} in view`, tone: 'neutral' as const, accent: 'bg-teal-700' },
      { title: 'Total Substations', value: summary?.totalSubstations ?? 0, icon: Factory, trend: substationTrend.label, tone: substationTrend.tone, accent: 'bg-indigo-700' },
      { title: 'Incoming Sources', value: summary?.totalIncomingSources ?? 0, icon: Cable, trend: equipmentTrend.label, tone: equipmentTrend.tone, accent: 'bg-sky-700' },
      { title: 'Outgoing Feeders', value: summary?.totalOutgoingFeeders ?? 0, icon: RadioTower, trend: equipmentTrend.label, tone: equipmentTrend.tone, accent: 'bg-emerald-700' },
      { title: 'Transformers', value: summary?.totalTransformers ?? 0, icon: Zap, trend: `${formatNumber(Math.round(equipmentSummaryQuery.data?.transformerCapacity.totalMva ?? 0))} MVA`, tone: 'neutral' as const, accent: 'bg-amber-600' },
      { title: 'Lightning Arresters', value: summary?.totalLightningArresters ?? 0, icon: ShieldCheck, trend: equipmentTrend.label, tone: equipmentTrend.tone, accent: 'bg-lime-700' },
      { title: 'Battery Banks', value: summary?.totalBatteryBanks ?? 0, icon: BatteryCharging, trend: `${formatNumber(Math.round(equipmentSummaryQuery.data?.battery.totalAh ?? 0))} Ah`, tone: 'neutral' as const, accent: 'bg-orange-600' },
      { title: 'Capacitor Banks', value: summary?.totalCapacitorBanks ?? 0, icon: CircleGauge, trend: `${formatNumber(Math.round(equipmentSummaryQuery.data?.capacitor.totalMvar ?? 0))} MVAR`, tone: 'neutral' as const, accent: 'bg-violet-700' },
    ]
  }, [equipmentSummaryQuery.data, filterOptions, summaryQuery.data])

  const recentActivity = useMemo(() => {
    const imports = (importHistoryQuery.data ?? []).slice(0, 2).map((item) => ({
      id: `import-${item.id}`,
      title: `Import ${item.status.toLowerCase()}: ${item.uploadedFile.originalFileName}`,
      meta: `${item.rowsImported} imported, ${item.rowsFailed} failed`,
      time: formatDateTime(item.timestamp),
    }))
    const errors = (recentImportErrorsQuery.data ?? []).slice(0, 2).map((item) => ({
      id: `error-${item.id}`,
      title: item.errorMessage,
      meta: `${item.importJob.uploadedFile.originalFileName} · Row ${item.row}`,
      time: formatDateTime(item.createdAt),
    }))

    return [...imports, ...errors].slice(0, 4)
  }, [importHistoryQuery.data, recentImportErrorsQuery.data])

  if (isInitialLoading) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
        <DashboardSkeleton />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
        <ErrorState onRetry={retryAll} />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mx-auto max-w-[1800px] space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Enterprise Overview</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl dark:text-white">KESCO Substation Dashboard</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Live operational view for hierarchy, assets, imports, and system readiness.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <span className={`h-2.5 w-2.5 rounded-full ${isRefreshing ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'}`} aria-hidden="true" />
                {isRefreshing ? 'Refreshing now' : 'Auto-refresh ready'}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Last updated {lastUpdatedAt}</div>
              <button
                type="button"
                onClick={retryAll}
                className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <FilterSelect label="Discom" value={filters.discomId ?? ''} options={filterOptions.discoms} onChange={(value) => updateFilter('discomId', value)} />
            <FilterSelect label="Zone" value={filters.zoneId ?? ''} options={filterOptions.zones} onChange={(value) => updateFilter('zoneId', value)} />
            <FilterSelect label="Vertical" value={filters.verticalId ?? ''} options={filterOptions.verticals} onChange={(value) => updateFilter('verticalId', value)} />
            <FilterSelect label="Sub Vertical" value={filters.subVerticalId ?? ''} options={filterOptions.subVerticals} onChange={(value) => updateFilter('subVerticalId', value)} />
            <FilterSelect label="Substation" value={filters.substationId ?? ''} options={filterOptions.substations} onChange={(value) => updateFilter('substationId', value)} />
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
          {statCards.map((card) => (
            <DashboardStatCard
              key={card.title}
              title={card.title}
              value={formatNumber(card.value)}
              icon={card.icon}
              trend={card.trend}
              trendTone={card.tone}
              accentClassName={card.accent}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <DashboardChartCard title="Equipment Distribution" subtitle="Live asset mix across equipment categories">
            {equipmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={equipmentChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={96} label>
                    {equipmentChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No equipment data" description="No equipment distribution is available for the selected filters." />
            )}
          </DashboardChartCard>

          <DashboardChartCard title="Hierarchy Distribution" subtitle="Equipment totals across the selected hierarchy">
            {hierarchyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hierarchyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No hierarchy data" description="No hierarchy distribution is available for the selected filters." />
            )}
          </DashboardChartCard>

          <DashboardChartCard title="Transformer Capacity" subtitle="Installed transformer capacity by hierarchy">
            {transformerChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformerChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="capacity" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No transformer capacity data" description="No transformer capacity is available for the selected filters." />
            )}
          </DashboardChartCard>

          <DashboardChartCard title="Feeder Load" subtitle="Connected load by hierarchy">
            {feederChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={feederChartData}>
                  <defs>
                    <linearGradient id="feederLoad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="load" stroke="#1d4ed8" strokeWidth={2} fill="url(#feederLoad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No feeder load data" description="No feeder load is available for the selected filters." />
            )}
          </DashboardChartCard>

          <DashboardChartCard title="Substation Status" subtitle="Active and inactive substations" className="xl:col-span-2">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={72} outerRadius={112} paddingAngle={3}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No substation status data" description="No status information is available for the selected filters." />
            )}
          </DashboardChartCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <DashboardSection title="Recent Imports" description="Latest workbook processing activity">
            {importHistoryQuery.data && importHistoryQuery.data.length > 0 ? (
              <div className="space-y-4">
                {importHistoryQuery.data.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.uploadedFile.originalFileName}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(item.timestamp)} · {item.uploadedBy.name}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No imports found" description="No import history is available for the selected filters." icon={FileSpreadsheet} />
            )}
          </DashboardSection>

          <DashboardSection title="Recent Import Errors" description="Validation issues awaiting correction">
            {recentImportErrorsQuery.data && recentImportErrorsQuery.data.length > 0 ? (
              <div className="space-y-4">
                {recentImportErrorsQuery.data.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/70 dark:bg-amber-950/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.importJob.uploadedFile.originalFileName}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.errorMessage}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Row {item.row} · {item.errorCode}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No import errors" description="No recent validation errors are available for the selected filters." icon={ShieldCheck} />
            )}
          </DashboardSection>

          <DashboardSection title="System Health" description="Current platform readiness">
            <div className="space-y-3">
              {[
                { label: 'Dashboard APIs', value: 'Operational', tone: 'text-emerald-700 dark:text-emerald-300' },
                { label: 'Import Queue', value: `${importHistoryQuery.data?.length ?? 0} recent jobs`, tone: 'text-slate-700 dark:text-slate-300' },
                { label: 'Data Quality', value: `${recentImportErrorsQuery.data?.length ?? 0} recent errors`, tone: (recentImportErrorsQuery.data?.length ?? 0) > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300' },
                { label: 'Map Coverage', value: `${mapQuery.data?.length ?? 0} markers`, tone: 'text-slate-700 dark:text-slate-300' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex min-w-0 items-center gap-3">
                    <Server className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                    <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                  <span className={`shrink-0 text-sm font-semibold ${item.tone}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </DashboardSection>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <DashboardSection title="Recent Activity" description="Derived from live imports and validation events">
            {recentActivity.length > 0 ? (
              <div className="space-y-5">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <Activity className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 border-b border-slate-200 pb-4 last:border-b-0 last:pb-0 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.meta}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{item.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No recent activity" description="Activity will appear when imports or validation events are available." icon={Activity} />
            )}
          </DashboardSection>

          <DashboardSection title="Quick Actions" description="Common dashboard shortcuts">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {quickActions.map((action) => (
                <QuickActionCard key={action.title} title={action.title} description={action.description} icon={action.icon} />
              ))}
            </div>
          </DashboardSection>
        </section>

        <DashboardSection title="Substation GIS Map" description="Live substation markers from dashboard map data">
          <DashboardMapPanel markers={mapQuery.data ?? []} />
        </DashboardSection>
      </div>
    </div>
  )
}
