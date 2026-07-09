import type { Discom, SubVertical, Vertical, Zone } from '../../types/hierarchy'
import type { ReportFiltersState } from '../../types/reports'
import type { Substation } from '../../types/substation'

type ReportFiltersProps = {
  value: ReportFiltersState
  discoms: Discom[]
  zones: Zone[]
  verticals: Vertical[]
  subVerticals: SubVertical[]
  substations: Substation[]
  onChange: (value: ReportFiltersState) => void
  onReset: () => void
}

function label(name: string, code?: string) {
  return code ? `${name} (${code})` : name
}

export default function ReportFilters({ value, discoms, zones, verticals, subVerticals, substations, onChange, onReset }: ReportFiltersProps) {
  const update = (patch: Partial<ReportFiltersState>) => onChange({ ...value, ...patch })

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">Report Filters</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Narrow reports by hierarchy, operating status, voltage, and date range.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Discom
          <select
            value={value.discomId}
            onChange={(event) => update({ discomId: event.target.value, zoneId: '', verticalId: '', subVerticalId: '', substationId: '' })}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          >
            <option value="">All Discoms</option>
            {discoms.map((item) => <option key={item.id} value={item.id}>{label(item.name, item.code)}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Zone
          <select
            value={value.zoneId}
            onChange={(event) => update({ zoneId: event.target.value, verticalId: '', subVerticalId: '', substationId: '' })}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          >
            <option value="">All Zones</option>
            {zones.map((item) => <option key={item.id} value={item.id}>{label(item.name, item.code)}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Vertical
          <select
            value={value.verticalId}
            onChange={(event) => update({ verticalId: event.target.value, subVerticalId: '', substationId: '' })}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          >
            <option value="">All Verticals</option>
            {verticals.map((item) => <option key={item.id} value={item.id}>{label(item.name, item.code)}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Sub Vertical
          <select
            value={value.subVerticalId}
            onChange={(event) => update({ subVerticalId: event.target.value, substationId: '' })}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          >
            <option value="">All Sub Verticals</option>
            {subVerticals.map((item) => <option key={item.id} value={item.id}>{label(item.name, item.code)}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Substation
          <select
            value={value.substationId}
            onChange={(event) => update({ substationId: event.target.value })}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          >
            <option value="">All Substations</option>
            {substations.map((item) => <option key={item.id} value={item.id}>{label(item.name, item.code)}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Voltage
          <input
            type="number"
            min="0"
            value={value.voltageLevelKv}
            onChange={(event) => update({ voltageLevelKv: event.target.value })}
            placeholder="Voltage kV"
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Status
          <select
            value={value.isActive}
            onChange={(event) => update({ isActive: event.target.value as ReportFiltersState['isActive'] })}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          >
            <option value="all">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Date From
          <input
            type="date"
            value={value.dateFrom}
            onChange={(event) => update({ dateFrom: event.target.value })}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Date To
          <input
            type="date"
            value={value.dateTo}
            onChange={(event) => update({ dateTo: event.target.value })}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
          />
        </label>
      </div>
    </section>
  )
}
