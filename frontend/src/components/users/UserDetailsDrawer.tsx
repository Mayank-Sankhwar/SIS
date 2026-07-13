import { X } from 'lucide-react'

import type { UserRecord } from '../../types/user'

type UserDetailsDrawerProps = {
  open: boolean
  user: UserRecord | null
  onClose: () => void
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-900 dark:text-slate-100">{value ?? '—'}</span>
    </div>
  )
}

export default function UserDetailsDrawer({ open, user, onClose }: UserDetailsDrawerProps) {
  if (!open || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">User details</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Operational profile and assigned area context.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white" aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Personal information</h3>
            <div className="space-y-3">
              <Row label="Name" value={user.name} />
              <Row label="Email" value={user.email} />
              <Row label="Employee ID" value={user.employeeId} />
              <Row label="Designation" value={user.designation} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role and assigned area</h3>
            <div className="space-y-3">
              <Row label="Role" value={user.role} />
              <Row label="Assigned Area" value={user.assignedArea} />
              <Row label="Status" value={user.status} />
              <Row label="Last Login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN') : 'Never'} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Audit information</h3>
            <div className="space-y-3">
              <Row label="Created By" value={user.createdBy} />
              <Row label="Created Date" value={user.createdAt ? new Date(user.createdAt).toLocaleString('en-IN') : undefined} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
