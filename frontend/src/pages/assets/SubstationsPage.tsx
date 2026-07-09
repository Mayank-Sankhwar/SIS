import { useMemo, useState } from 'react'
import { Download, ExternalLink, Eye, Plus, RefreshCcw, Search, Trash2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import DeleteConfirmation from '../../components/hierarchy/DeleteConfirmation'
import Pagination from '../../components/hierarchy/Pagination'
import StatusBadge from '../../components/hierarchy/StatusBadge'
import SubstationDetailsDrawer from '../../components/substations/SubstationDetailsDrawer'
import SubstationFormDialog from '../../components/substations/SubstationFormDialog'
import { useDashboardMap } from '../../hooks/useDashboard'
import { useHierarchyList } from '../../hooks/useHierarchy'
import {
  useCreateSubstation,
  useDeleteSubstation,
  useSubstation,
  useSubstations,
  useUpdateSubstation,
} from '../../hooks/useSubstations'
import type { BackendApiError, Discom, SubVertical, Vertical, Zone } from '../../types/hierarchy'
import type { ActiveFilter, Substation, SubstationListParams, SubstationPayload, SubstationSortBy } from '../../types/substation'

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-IN') : '-'
}

function exportRows(rows: Substation[]) {
  const headers = ['Code', 'Name', 'Voltage Level', 'Sub Vertical', 'Vertical', 'Zone', 'Discom', 'Commissioning Date', 'Status']
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.code,
        row.name,
        row.voltageLevelKv,
        row.subVertical.name,
        row.subVertical.vertical.name,
        row.subVertical.vertical.zone.name,
        row.subVertical.vertical.zone.discom.name,
        row.commissioningDate ?? '',
        row.isActive ? 'Active' : 'Inactive',
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'substations.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function SubstationsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [sortBy, setSortBy] = useState<SubstationSortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [discomId, setDiscomId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [verticalId, setVerticalId] = useState('')
  const [subVerticalId, setSubVerticalId] = useState('')
  const [voltageLevelKv, setVoltageLevelKv] = useState('')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [selectedSubstation, setSelectedSubstation] = useState<Substation | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Substation | null>(null)
  const [formError, setFormError] = useState<BackendApiError | null>(null)

  const params = useMemo<SubstationListParams>(
    () => ({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      ...(activeFilter !== 'all' ? { isActive: activeFilter } : {}),
      ...(discomId ? { discomId } : {}),
      ...(zoneId ? { zoneId } : {}),
      ...(verticalId ? { verticalId } : {}),
      ...(subVerticalId ? { subVerticalId } : {}),
      ...(voltageLevelKv ? { voltageLevelKv } : {}),
    }),
    [activeFilter, discomId, limit, page, search, sortBy, sortOrder, subVerticalId, verticalId, voltageLevelKv, zoneId],
  )

  const query = useSubstations(params)
  const detailQuery = useSubstation(detailsId)
  const mapQuery = useDashboardMap(detailsId ? { substationId: detailsId } : {})
  const createMutation = useCreateSubstation()
  const updateMutation = useUpdateSubstation()
  const deleteMutation = useDeleteSubstation()

  const discomsQuery = useHierarchyList('discoms', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' })
  const zonesQuery = useHierarchyList('zones', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}) })
  const verticalsQuery = useHierarchyList('verticals', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}), ...(zoneId ? { zoneId } : {}) })
  const subVerticalsQuery = useHierarchyList('sub-verticals', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}), ...(zoneId ? { zoneId } : {}), ...(verticalId ? { verticalId } : {}) })

  const rows = query.data?.data ?? []
  const pagination = query.data?.pagination
  const selectedMapMarker = mapQuery.data?.find((marker) => marker.id === detailsId)

  const handleSort = (nextSortBy: SubstationSortBy) => {
    if (nextSortBy === sortBy) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(nextSortBy)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const submitForm = (payload: SubstationPayload) => {
    setFormError(null)
    if (dialogMode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Substation created successfully')
          setDialogMode(null)
        },
        onError: (error) => setFormError(error as BackendApiError),
      })
      return
    }

    if (!selectedSubstation) return
    updateMutation.mutate(
      { id: selectedSubstation.id, payload },
      {
        onSuccess: () => {
          toast.success('Substation updated successfully')
          setDialogMode(null)
          setSelectedSubstation(null)
        },
        onError: (error) => setFormError(error as BackendApiError),
      },
    )
  }

  const sortButton = (label: string, field: SubstationSortBy) => (
    <button type="button" onClick={() => handleSort(field)} className="inline-flex items-center gap-1 transition hover:text-slate-900 dark:hover:text-white">
      {label}
      {sortBy === field ? <span>{sortOrder === 'asc' ? '↑' : '↓'}</span> : null}
    </button>
  )

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mx-auto max-w-[1800px] rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">Substations</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage substation master records, hierarchy mapping, and GIS coordinates.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void query.refetch()} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
                <RefreshCcw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh
              </button>
              <button type="button" onClick={() => exportRows(rows)} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
                <Download className="h-4 w-4" aria-hidden="true" /> Export
              </button>
              <button type="button" onClick={() => { setSelectedSubstation(null); setFormError(null); setDialogMode('create') }} className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500">
                <Plus className="h-4 w-4" aria-hidden="true" /> Create
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            <label className="relative block xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search name, code, address" className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </label>
            <select value={discomId} onChange={(event) => { setDiscomId(event.target.value); setZoneId(''); setVerticalId(''); setSubVerticalId(''); setPage(1) }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
              <option value="">All Discoms</option>
              {(discomsQuery.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={zoneId} onChange={(event) => { setZoneId(event.target.value); setVerticalId(''); setSubVerticalId(''); setPage(1) }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
              <option value="">All Zones</option>
              {(zonesQuery.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={verticalId} onChange={(event) => { setVerticalId(event.target.value); setSubVerticalId(''); setPage(1) }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
              <option value="">All Verticals</option>
              {(verticalsQuery.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select value={subVerticalId} onChange={(event) => { setSubVerticalId(event.target.value); setPage(1) }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
              <option value="">All Sub Verticals</option>
              {(subVerticalsQuery.data?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <input value={voltageLevelKv} onChange={(event) => { setVoltageLevelKv(event.target.value); setPage(1) }} placeholder="Voltage KV" type="number" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <select value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value as ActiveFilter); setPage(1) }} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
              <option value="all">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {query.isError ? (
          <div className="p-5"><ErrorState title="Unable to load substations" onRetry={() => void query.refetch()} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/70">
                <tr>
                  {[
                    ['Code', 'code'],
                    ['Name', 'name'],
                    ['Voltage Level', 'voltageLevelKv'],
                    ['Sub Vertical', null],
                    ['Vertical', null],
                    ['Zone', null],
                    ['Discom', null],
                    ['Commissioning Date', 'commissioningDate'],
                    ['Status', null],
                  ].map(([label, field]) => (
                    <th key={label} className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {field ? sortButton(label!, field as SubstationSortBy) : label}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
                {query.isLoading ? Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>{Array.from({ length: 10 }).map((__, cell) => <td key={cell} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /></td>)}</tr>
                )) : null}
                {!query.isLoading && rows.length === 0 ? <tr><td colSpan={10} className="p-5"><EmptyState title="No substations found" description="Try changing the search term or filters." /></td></tr> : null}
                {!query.isLoading ? rows.map((row) => (
                  <tr key={row.id} onClick={() => setDetailsId(row.id)} className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-900/70">
                    <td className="whitespace-nowrap px-5 py-4"><span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">{row.code}</span></td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950 dark:text-white">{row.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{row.voltageLevelKv} kV</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{row.subVertical.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{row.subVertical.vertical.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{row.subVertical.vertical.zone.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{row.subVertical.vertical.zone.discom.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDate(row.commissioningDate)}</td>
                    <td className="whitespace-nowrap px-5 py-4"><StatusBadge isActive={row.isActive} /></td>
                    <td className="whitespace-nowrap px-5 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                      <div className="inline-flex items-center gap-2">
                        <button type="button" onClick={() => setDetailsId(row.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900" aria-label="View details"><Eye className="h-4 w-4" /></button>
                        {row.latitude !== null && row.longitude !== null ? <a href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900" aria-label="Open location"><ExternalLink className="h-4 w-4" /></a> : null}
                        <button type="button" onClick={() => { setSelectedSubstation(row); setFormError(null); setDialogMode('edit') }} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900" aria-label="Edit"><Edit className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setDeleteTarget(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/30" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} limit={limit} total={pagination?.total ?? 0} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1) }} />
      </div>

      <SubstationFormDialog
        open={dialogMode !== null}
        mode={dialogMode ?? 'create'}
        initialSubstation={selectedSubstation}
        discoms={(discomsQuery.data?.items ?? []) as Discom[]}
        zones={(zonesQuery.data?.items ?? []) as Zone[]}
        verticals={(verticalsQuery.data?.items ?? []) as Vertical[]}
        subVerticals={(subVerticalsQuery.data?.items ?? []) as SubVertical[]}
        backendError={formError}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => { setDialogMode(null); setSelectedSubstation(null); setFormError(null) }}
        onSubmit={submitForm}
      />

      <DeleteConfirmation
        open={Boolean(deleteTarget)}
        entityName={deleteTarget?.name ?? ''}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => { toast.success('Substation deleted successfully'); setDeleteTarget(null) },
            onError: (error) => toast.error((error as BackendApiError).response?.data?.message ?? 'Delete failed'),
          })
        }}
      />

      <SubstationDetailsDrawer
        open={Boolean(detailsId)}
        substation={detailQuery.data ?? null}
        loading={detailQuery.isLoading}
        equipmentCounts={selectedMapMarker?.equipmentCounts}
        onClose={() => setDetailsId(null)}
      />
    </div>
  )
}
