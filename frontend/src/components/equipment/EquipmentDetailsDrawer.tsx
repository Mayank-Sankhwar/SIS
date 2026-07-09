import { X } from 'lucide-react'

import type { EquipmentConfig, EquipmentEntity } from '../../types/equipment'

type EquipmentDetailsDrawerProps = {
  open: boolean
  config: EquipmentConfig
  item: EquipmentEntity | null
  loading?: boolean
  onClose: () => void
}

function display(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Active' : 'Inactive'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString('en-IN')
  return String(value)
}

function Row({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-3 border-b border-slate-100 py-2 text-sm last:border-b-0 dark:border-slate-800">
      <dt className="font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-white">{display(value)}</dd>
    </div>
  )
}

export default function EquipmentDetailsDrawer({ open, config, item, loading, onClose }: EquipmentDetailsDrawerProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">{config.title}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950 dark:text-white">{item ? display(item[config.primaryField]) : 'Loading...'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Close details"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading || !item ? (
            <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />)}</div>
          ) : (
            <div className="space-y-6">
              <section><h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">General Information</h3><dl className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">{config.fields.map((field) => <Row key={field.name} label={field.label} value={item[field.name]} />)}<Row label="Status" value={item.isActive} /></dl></section>
              <section><h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Parent Substation</h3><dl className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"><Row label="Substation" value={item.substation?.name} /><Row label="Code" value={item.substation?.code} /></dl></section>
              <section><h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hierarchy</h3><dl className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"><Row label="Discom" value={item.substation?.subVertical?.vertical?.zone?.discom?.name} /><Row label="Zone" value={item.substation?.subVertical?.vertical?.zone?.name} /><Row label="Vertical" value={item.substation?.subVertical?.vertical?.name} /><Row label="Sub Vertical" value={item.substation?.subVertical?.name} /></dl></section>
              <section><h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Audit Information</h3><dl className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"><Row label="Created By" value={item.createdBy?.name} /><Row label="Updated By" value={item.updatedBy?.name} /><Row label="Created At" value={item.createdAt} /><Row label="Updated At" value={item.updatedAt} /></dl></section>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
