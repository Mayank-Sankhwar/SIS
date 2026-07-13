import { useMemo, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import UserDetailsDrawer from '../../components/users/UserDetailsDrawer'
import UserFormDialog from '../../components/users/UserFormDialog'
import { useHierarchyList } from '../../hooks/useHierarchy'
import { useCreateUser, useUsers } from '../../hooks/useUsers'
import { useSubstations } from '../../hooks/useSubstations'
import type { BackendApiError, Discom, SubVertical, Vertical, Zone } from '../../types/hierarchy'
import type { CreateUserPayload, UserFormValues, UserRecord, UserRole, UserStatus } from '../../types/user'
import type { Substation } from '../../types/substation'

const roleOptions = ['all', 'EE', 'AE', 'JE'] as const
const statusOptions = ['all', 'Active', 'Inactive', 'Pending'] as const

function toPayload(values: UserFormValues): CreateUserPayload {
  const areaMapping = {
    areaType: values.areaType,
    isPrimary: true,
    ...(values.areaType === 'DISCOM' ? { discomId: values.discomId } : {}),
    ...(values.areaType === 'ZONE' ? { zoneId: values.zoneId } : {}),
    ...(values.areaType === 'VERTICAL' ? { verticalId: values.verticalId } : {}),
    ...(values.areaType === 'SUB_VERTICAL' ? { subVerticalId: values.subVerticalId } : {}),
    ...(values.areaType === 'SUBSTATION' ? { substationId: values.substationId } : {}),
  }

  return {
    name: values.name,
    email: values.email,
    role: values.role,
    employeeId: values.employeeId || undefined,
    designation: values.designation || undefined,
    areaMappings: [areaMapping],
  }
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'all' | UserRole>('all')
  const [status, setStatus] = useState<'all' | UserStatus>('all')
  const [discomId, setDiscomId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [verticalId, setVerticalId] = useState('')
  const [subVerticalId, setSubVerticalId] = useState('')
  const [substationId, setSubstationId] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [createError, setCreateError] = useState<BackendApiError | null>(null)

  const params = useMemo(() => ({ page, limit: pageSize, search, role, status, discomId, zoneId, verticalId, subVerticalId, substationId }), [discomId, page, pageSize, role, search, status, substationId, subVerticalId, verticalId, zoneId])

  const usersQuery = useUsers(params)
  const createUserMutation = useCreateUser()

  const hierarchyParams = useMemo(() => ({ page: 1, limit: 100, sortBy: 'name' as const, sortOrder: 'asc' as const }), [])
  const discomsQuery = useHierarchyList('discoms', hierarchyParams)
  const zonesQuery = useHierarchyList('zones', { ...hierarchyParams, ...(discomId ? { discomId } : {}) })
  const verticalsQuery = useHierarchyList('verticals', { ...hierarchyParams, ...(discomId ? { discomId } : {}), ...(zoneId ? { zoneId } : {}) })
  const subVerticalsQuery = useHierarchyList('sub-verticals', { ...hierarchyParams, ...(discomId ? { discomId } : {}), ...(zoneId ? { zoneId } : {}), ...(verticalId ? { verticalId } : {}) })
  const substationsQuery = useSubstations({ page: 1, limit: 200, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}), ...(zoneId ? { zoneId } : {}), ...(verticalId ? { verticalId } : {}), ...(subVerticalId ? { subVerticalId } : {}) })

  const users = (usersQuery.data?.data ?? []) as UserRecord[]
  const totalUsers = usersQuery.data?.pagination?.total ?? 0
  const totalPages = usersQuery.data?.pagination?.totalPages ?? 1

  const handleCreate = (values: UserFormValues) => {
    setCreateError(null)
    createUserMutation.mutate(toPayload(values), {
      onSuccess: () => {
        toast.success('User created successfully')
        setCreateOpen(false)
        void usersQuery.refetch()
      },
      onError: (error) => setCreateError(error as BackendApiError),
    })
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">Administration</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">User management</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Create, review, and manage operational users and their assigned work areas.</p>
            </div>
            <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Create user
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-4 lg:grid-cols-4">
            <label className="block lg:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Name, employee ID, or email" className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Role</span>
              <select value={role} onChange={(event) => { setRole(event.target.value as 'all' | UserRole); setPage(1) }} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                {roleOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All roles' : option}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Status</span>
              <select value={status} onChange={(event) => { setStatus(event.target.value as 'all' | UserStatus); setPage(1) }} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                {statusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All statuses' : option}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Discom</span>
              <select value={discomId} onChange={(event) => { setDiscomId(event.target.value); setZoneId(''); setVerticalId(''); setSubVerticalId(''); setSubstationId(''); setPage(1) }} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option value="">All Discoms</option>
                {(discomsQuery.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Zone</span>
              <select value={zoneId} onChange={(event) => { setZoneId(event.target.value); setVerticalId(''); setSubVerticalId(''); setSubstationId(''); setPage(1) }} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option value="">All Zones</option>
                {(zonesQuery.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Vertical</span>
              <select value={verticalId} onChange={(event) => { setVerticalId(event.target.value); setSubVerticalId(''); setSubstationId(''); setPage(1) }} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option value="">All Verticals</option>
                {(verticalsQuery.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Substation</span>
              <select value={substationId} onChange={(event) => { setSubstationId(event.target.value); setPage(1) }} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option value="">All Substations</option>
                {(substationsQuery.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="p-4">
          {usersQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
            </div>
          ) : null}

          {usersQuery.isError ? <ErrorState title="Unable to load users" description="The user management API returned an error. Please retry the request." onRetry={() => void usersQuery.refetch()} /> : null}

          {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? <EmptyState title="No users found" description="Create a user or adjust the filters to see records." /> : null}

          {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/70">
                  <tr>
                    {['Employee ID', 'Name', 'Email', 'Role', 'Designation', 'Assigned Area', 'Status', 'Last Login', 'Actions'].map((header) => <th key={header} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{header}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{user.employeeId ?? '—'}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{user.name}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{user.email}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{user.role}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{user.designation ?? '—'}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{user.assignedArea}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{user.status}</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'Never'}</td>
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => setSelectedUser(user)} className="text-sm font-semibold text-blue-700 dark:text-blue-300">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>{totalUsers} users</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">Next</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <UserFormDialog
        open={isCreateOpen}
        isSubmitting={createUserMutation.isPending}
        error={createError}
        discoms={(discomsQuery.data?.items ?? []) as Discom[]}
        zones={(zonesQuery.data?.items ?? []) as Zone[]}
        verticals={(verticalsQuery.data?.items ?? []) as Vertical[]}
        subVerticals={(subVerticalsQuery.data?.items ?? []) as SubVertical[]}
        substations={(substationsQuery.data?.data ?? []) as Substation[]}
        onClose={() => { setCreateOpen(false); setCreateError(null) }}
        onSubmit={handleCreate}
      />
      <UserDetailsDrawer open={Boolean(selectedUser)} user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  )
}
