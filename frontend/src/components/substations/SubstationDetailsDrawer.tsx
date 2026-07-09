import { X } from 'lucide-react'

import type { EquipmentCounts } from '../../types/dashboard'
import type { SubstationDetail } from '../../types/substation'
import MiniMapPreview from './MiniMapPreview'

type SubstationDetailsDrawerProps = {
  open: boolean
  substation: SubstationDetail | null
  equipmentCounts?: EquipmentCounts
  loading?: boolean
  onClose: () => void
}

function valueOrDash(value: string | number | null | undefined) {
  return value === null || value === undefined || value === '' ? '-' : value
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 border-b border-slate-100 py-2 text-sm last:border-b-0 dark:border-slate-800">
      <dt className="font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-white">{valueOrDash(value)}</dd>
    </div>
  )
}

export default function SubstationDetailsDrawer({ open, substation, equipmentCounts, loading, onClose }: SubstationDetailsDrawerProps) {
  if (!open) return null

  const counts = equipmentCounts ?? {
    incomingSources: 0,
    outgoingFeeders: 0,
    transformers: 0,
    lightningArresters: 0,
    batteryBanks: 0,
    capacitorBanks: 0,
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Substation Details</p>
            <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950 dark:text-white">{substation?.name ?? 'Loading...'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Close details">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading || !substation ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />)}
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">General Information</h3>
                <dl className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <InfoRow label="Code" value={substation.code} />
                  <InfoRow label="Name" value={substation.name} />
                  <InfoRow label="Voltage" value={`${substation.voltageLevelKv} kV`} />
                  <InfoRow label="Status" value={substation.isActive ? 'Active' : 'Inactive'} />
                  <InfoRow label="Commissioning" value={substation.commissioningDate ? new Date(substation.commissioningDate).toLocaleDateString('en-IN') : null} />
                </dl>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hierarchy</h3>
                <dl className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <InfoRow label="Discom" value={substation.subVertical.vertical.zone.discom.name} />
                  <InfoRow label="Zone" value={substation.subVertical.vertical.zone.name} />
                  <InfoRow label="Vertical" value={substation.subVertical.vertical.name} />
                  <InfoRow label="Sub Vertical" value={substation.subVertical.name} />
                </dl>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Address</h3>
                <p className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">{valueOrDash(substation.address)}</p>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Coordinates</h3>
                <MiniMapPreview latitude={substation.latitude} longitude={substation.longitude} />
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Audit</h3>
                <dl className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <InfoRow label="Created By" value={substation.createdBy?.name} />
                  <InfoRow label="Updated By" value={substation.updatedBy?.name} />
                  <InfoRow label="Created At" value={new Date(substation.createdAt).toLocaleString('en-IN')} />
                  <InfoRow label="Updated At" value={new Date(substation.updatedAt).toLocaleString('en-IN')} />
                </dl>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Equipment Counts</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Incoming Sources', counts.incomingSources],
                    ['Outgoing Feeders', counts.outgoingFeeders],
                    ['Transformers', counts.transformers],
                    ['Lightning Arresters', counts.lightningArresters],
                    ['Battery Banks', counts.batteryBanks],
                    ['Capacitor Banks', counts.capacitorBanks],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
