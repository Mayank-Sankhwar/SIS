import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import EquipmentDeleteDialog from '../../components/equipment/EquipmentDeleteDialog'
import EquipmentDetailsDrawer from '../../components/equipment/EquipmentDetailsDrawer'
import EquipmentFormDialog from '../../components/equipment/EquipmentFormDialog'
import EquipmentTable from '../../components/equipment/EquipmentTable'
import EquipmentToolbar from '../../components/equipment/EquipmentToolbar'
import Pagination from '../../components/hierarchy/Pagination'
import { useEquipmentDetail, useEquipmentList, useCreateEquipment, useDeleteEquipment, useUpdateEquipment } from '../../hooks/useEquipment'
import { useHierarchyList } from '../../hooks/useHierarchy'
import { useSubstations } from '../../hooks/useSubstations'
import type { BackendApiError, Discom, SubVertical, Vertical, Zone } from '../../types/hierarchy'
import type { EquipmentConfig, EquipmentEntity, EquipmentListParams, EquipmentPayload } from '../../types/equipment'
import type { Substation } from '../../types/substation'

type Props = { config: EquipmentConfig }

function exportRows(config: EquipmentConfig, rows: EquipmentEntity[]) {
  const headers = [...config.columns.map((column) => column.label), 'Substation', 'Status']
  const csv = [
    headers.join(','),
    ...rows.map((row) => [...config.columns.map((column) => row[column.key] ?? ''), row.substation?.name ?? '', row.isActive ? 'Active' : 'Inactive'].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${config.type}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function EquipmentManagementPage({ config }: Props) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [sortBy, setSortBy] = useState(config.defaultSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activeFilter, setActiveFilter] = useState('all')
  const [discomId, setDiscomId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [verticalId, setVerticalId] = useState('')
  const [subVerticalId, setSubVerticalId] = useState('')
  const [substationId, setSubstationId] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<EquipmentEntity | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EquipmentEntity | null>(null)
  const [formError, setFormError] = useState<BackendApiError | null>(null)

  const params = useMemo<EquipmentListParams>(() => ({
    page, limit, search, sortBy, sortOrder,
    ...(activeFilter !== 'all' ? { isActive: activeFilter } : {}),
    ...(discomId ? { discomId } : {}),
    ...(zoneId ? { zoneId } : {}),
    ...(verticalId ? { verticalId } : {}),
    ...(subVerticalId ? { subVerticalId } : {}),
    ...(substationId ? { substationId } : {}),
    ...Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value)),
  }), [activeFilter, discomId, filterValues, limit, page, search, sortBy, sortOrder, subVerticalId, substationId, verticalId, zoneId])

  const query = useEquipmentList(config.type, config.endpoint, params)
  const detailQuery = useEquipmentDetail(config.type, config.endpoint, detailsId)
  const createMutation = useCreateEquipment(config.type, config.endpoint)
  const updateMutation = useUpdateEquipment(config.type, config.endpoint)
  const deleteMutation = useDeleteEquipment(config.type, config.endpoint)

  const discomsQuery = useHierarchyList('discoms', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' })
  const zonesQuery = useHierarchyList('zones', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}) })
  const verticalsQuery = useHierarchyList('verticals', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}), ...(zoneId ? { zoneId } : {}) })
  const subVerticalsQuery = useHierarchyList('sub-verticals', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}), ...(zoneId ? { zoneId } : {}), ...(verticalId ? { verticalId } : {}) })
  const substationsQuery = useSubstations({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}), ...(zoneId ? { zoneId } : {}), ...(verticalId ? { verticalId } : {}), ...(subVerticalId ? { subVerticalId } : {}) })

  const rows = query.data?.data ?? []
  const total = query.data?.pagination.total ?? 0

  const changeHierarchy = (key: 'discomId' | 'zoneId' | 'verticalId' | 'subVerticalId' | 'substationId', value: string) => {
    if (key === 'discomId') { setDiscomId(value); setZoneId(''); setVerticalId(''); setSubVerticalId(''); setSubstationId('') }
    if (key === 'zoneId') { setZoneId(value); setVerticalId(''); setSubVerticalId(''); setSubstationId('') }
    if (key === 'verticalId') { setVerticalId(value); setSubVerticalId(''); setSubstationId('') }
    if (key === 'subVerticalId') { setSubVerticalId(value); setSubstationId('') }
    if (key === 'substationId') setSubstationId(value)
    setPage(1)
  }

  const submit = (payload: EquipmentPayload) => {
    setFormError(null)
    if (dialogMode === 'create') {
      createMutation.mutate(payload, { onSuccess: () => { toast.success('Equipment created successfully'); setDialogMode(null) }, onError: (error) => setFormError(error as BackendApiError) })
      return
    }
    if (!selected) return
    updateMutation.mutate({ id: selected.id, payload }, { onSuccess: () => { toast.success('Equipment updated successfully'); setDialogMode(null); setSelected(null) }, onError: (error) => setFormError(error as BackendApiError) })
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mx-auto max-w-[1800px] rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
        <EquipmentToolbar
          title={config.title}
          search={search}
          isRefreshing={query.isFetching}
          activeFilter={activeFilter}
          discomId={discomId}
          zoneId={zoneId}
          verticalId={verticalId}
          subVerticalId={subVerticalId}
          substationId={substationId}
          discoms={(discomsQuery.data?.items ?? []) as Discom[]}
          zones={(zonesQuery.data?.items ?? []) as Zone[]}
          verticals={(verticalsQuery.data?.items ?? []) as Vertical[]}
          subVerticals={(subVerticalsQuery.data?.items ?? []) as SubVertical[]}
          substations={(substationsQuery.data?.data ?? []) as Substation[]}
          numericFilters={config.numericFilters}
          textFilters={config.textFilters}
          filterValues={filterValues}
          onSearchChange={(value) => { setSearch(value); setPage(1) }}
          onActiveFilterChange={(value) => { setActiveFilter(value); setPage(1) }}
          onHierarchyChange={changeHierarchy}
          onFilterValueChange={(key, value) => { setFilterValues((current) => ({ ...current, [key]: value })); setPage(1) }}
          onRefresh={() => void query.refetch()}
          onExport={() => exportRows(config, rows)}
          onCreate={() => { setSelected(null); setFormError(null); setDialogMode('create') }}
        />
        <EquipmentTable
          rows={rows}
          columns={config.columns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          loading={query.isLoading}
          error={query.isError}
          onRetry={() => void query.refetch()}
          onSort={(field) => { if (field === sortBy) setSortOrder((current) => current === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortOrder('asc') } setPage(1) }}
          onView={(row) => setDetailsId(row.id)}
          onEdit={(row) => { setSelected(row); setFormError(null); setDialogMode('edit') }}
          onDelete={setDeleteTarget}
        />
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1) }} />
      </div>
      <EquipmentFormDialog open={dialogMode !== null} mode={dialogMode ?? 'create'} config={config} item={selected} substations={(substationsQuery.data?.data ?? []) as Substation[]} error={formError} isSubmitting={createMutation.isPending || updateMutation.isPending} onClose={() => { setDialogMode(null); setSelected(null); setFormError(null) }} onSubmit={submit} />
      <EquipmentDeleteDialog open={Boolean(deleteTarget)} entityName={deleteTarget ? String(deleteTarget[config.primaryField] ?? 'record') : ''} isDeleting={deleteMutation.isPending} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (!deleteTarget) return; deleteMutation.mutate(deleteTarget.id, { onSuccess: () => { toast.success('Equipment deleted successfully'); setDeleteTarget(null) }, onError: (error) => toast.error((error as BackendApiError).response?.data?.message ?? 'Delete failed') }) }} />
      <EquipmentDetailsDrawer open={Boolean(detailsId)} config={config} item={detailQuery.data ?? null} loading={detailQuery.isLoading} onClose={() => setDetailsId(null)} />
    </div>
  )
}
