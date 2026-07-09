import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import DeleteConfirmation from '../../components/hierarchy/DeleteConfirmation'
import EntityFormDialog from '../../components/hierarchy/EntityFormDialog'
import EntityTable, { defaultEntityColumns, type EntityTableColumn } from '../../components/hierarchy/EntityTable'
import Pagination from '../../components/hierarchy/Pagination'
import TableToolbar from '../../components/hierarchy/TableToolbar'
import {
  useCreateHierarchyEntity,
  useDeleteHierarchyEntity,
  useHierarchyList,
  useUpdateHierarchyEntity,
} from '../../hooks/useHierarchy'
import type {
  ActiveFilter,
  BackendApiError,
  Discom,
  HierarchyEntity,
  HierarchyEntityType,
  HierarchyFormValues,
  HierarchyListParams,
  HierarchySortBy,
  SortOrder,
  SubVertical,
  Vertical,
  Zone,
} from '../../types/hierarchy'

type HierarchyManagementPageProps = {
  entityType: HierarchyEntityType
  title: string
}

type EditableEntity = HierarchyEntity & {
  discomId?: string
  zoneId?: string
  verticalId?: string
}

function parentColumns(entityType: HierarchyEntityType): EntityTableColumn<EditableEntity>[] {
  if (entityType === 'zones') {
    return [
      {
        key: 'discom',
        header: 'Discom',
        render: (item) => <span className="font-medium text-slate-800 dark:text-slate-200">{(item as Zone).discom?.name ?? '-'}</span>,
      },
    ]
  }

  if (entityType === 'verticals') {
    return [
      {
        key: 'discom',
        header: 'Discom',
        render: (item) => <span className="font-medium text-slate-800 dark:text-slate-200">{(item as Vertical).zone?.discom?.name ?? '-'}</span>,
      },
      {
        key: 'zone',
        header: 'Zone',
        render: (item) => <span className="font-medium text-slate-800 dark:text-slate-200">{(item as Vertical).zone?.name ?? '-'}</span>,
      },
    ]
  }

  if (entityType === 'sub-verticals') {
    return [
      {
        key: 'discom',
        header: 'Discom',
        render: (item) => <span className="font-medium text-slate-800 dark:text-slate-200">{(item as SubVertical).vertical?.zone?.discom?.name ?? '-'}</span>,
      },
      {
        key: 'zone',
        header: 'Zone',
        render: (item) => <span className="font-medium text-slate-800 dark:text-slate-200">{(item as SubVertical).vertical?.zone?.name ?? '-'}</span>,
      },
      {
        key: 'vertical',
        header: 'Vertical',
        render: (item) => <span className="font-medium text-slate-800 dark:text-slate-200">{(item as SubVertical).vertical?.name ?? '-'}</span>,
      },
    ]
  }

  return []
}

function toFormValues(entity?: EditableEntity | null): HierarchyFormValues {
  return {
    name: entity?.name ?? '',
    code: entity?.code ?? '',
    discomId: entity?.discomId ?? '',
    zoneId: entity?.zoneId ?? '',
    verticalId: entity?.verticalId ?? '',
  }
}

function exportRows(filename: string, rows: EditableEntity[]) {
  const headers = ['Name', 'Code', 'Status', 'Created At', 'Updated At']
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      [row.name, row.code, row.isActive ? 'Active' : 'Inactive', row.createdAt, row.updatedAt]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function HierarchyManagementPage({ entityType, title }: HierarchyManagementPageProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [sortBy, setSortBy] = useState<HierarchySortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [discomId, setDiscomId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [verticalId, setVerticalId] = useState('')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<EditableEntity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EditableEntity | null>(null)
  const [formError, setFormError] = useState<BackendApiError | null>(null)

  const params = useMemo<HierarchyListParams>(
    () => ({
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      ...(entityType !== 'discoms' && activeFilter !== 'all' ? { isActive: activeFilter } : {}),
      ...(discomId ? { discomId } : {}),
      ...(zoneId ? { zoneId } : {}),
      ...(verticalId ? { verticalId } : {}),
    }),
    [activeFilter, discomId, entityType, limit, page, search, sortBy, sortOrder, verticalId, zoneId],
  )

  const query = useHierarchyList(entityType, params)
  const discomsQuery = useHierarchyList('discoms', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' })
  const zonesQuery = useHierarchyList('zones', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}) })
  const verticalsQuery = useHierarchyList('verticals', { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', ...(discomId ? { discomId } : {}), ...(zoneId ? { zoneId } : {}) })

  const createMutation = useCreateHierarchyEntity(entityType)
  const updateMutation = useUpdateHierarchyEntity(entityType)
  const deleteMutation = useDeleteHierarchyEntity(entityType)

  const items = (query.data?.items ?? []) as EditableEntity[]
  const total = query.data?.total ?? 0

  const columns = useMemo<EntityTableColumn<EditableEntity>[]>(
    () => [...defaultEntityColumns<EditableEntity>().slice(0, 2), ...parentColumns(entityType), ...defaultEntityColumns<EditableEntity>().slice(2)],
    [entityType],
  )

  const handleSort = (nextSortBy: HierarchySortBy) => {
    if (nextSortBy === sortBy) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(nextSortBy)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const handleSubmit = (values: HierarchyFormValues) => {
    setFormError(null)
    const payload = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== '')) as HierarchyFormValues

    if (dialogMode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Record created successfully')
          setDialogMode(null)
        },
        onError: (error) => setFormError(error as BackendApiError),
      })
      return
    }

    if (selectedEntity) {
      updateMutation.mutate(
        { id: selectedEntity.id, payload },
        {
          onSuccess: () => {
            toast.success('Record updated successfully')
            setDialogMode(null)
            setSelectedEntity(null)
          },
          onError: (error) => setFormError(error as BackendApiError),
        },
      )
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Record deleted successfully')
        setDeleteTarget(null)
      },
      onError: (error) => {
        const apiError = error as BackendApiError
        toast.error(apiError.response?.data?.message ?? 'Delete failed')
      },
    })
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mx-auto max-w-[1800px] rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
        <TableToolbar
          title={title}
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          activeFilter={entityType === 'discoms' ? undefined : activeFilter}
          onActiveFilterChange={
            entityType === 'discoms'
              ? undefined
              : (value) => {
                  setActiveFilter(value)
                  setPage(1)
                }
          }
          discomId={discomId}
          zoneId={zoneId}
          verticalId={verticalId}
          discoms={(discomsQuery.data?.items ?? []) as Discom[]}
          zones={(zonesQuery.data?.items ?? []) as Zone[]}
          verticals={(verticalsQuery.data?.items ?? []) as Vertical[]}
          onDiscomChange={
            entityType === 'discoms'
              ? undefined
              : (value) => {
                  setDiscomId(value)
                  setZoneId('')
                  setVerticalId('')
                  setPage(1)
                }
          }
          onZoneChange={
            entityType === 'verticals' || entityType === 'sub-verticals'
              ? (value) => {
                  setZoneId(value)
                  setVerticalId('')
                  setPage(1)
                }
              : undefined
          }
          onVerticalChange={
            entityType === 'sub-verticals'
              ? (value) => {
                  setVerticalId(value)
                  setPage(1)
                }
              : undefined
          }
          onRefresh={() => void query.refetch()}
          onExport={() => exportRows(entityType, items)}
          onCreate={() => {
            setFormError(null)
            setSelectedEntity(null)
            setDialogMode('create')
          }}
          isRefreshing={query.isFetching}
        />

        <EntityTable
          items={items}
          columns={columns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          loading={query.isLoading}
          error={query.isError}
          onSort={handleSort}
          onRetry={() => void query.refetch()}
          onEdit={(item) => {
            setFormError(null)
            setSelectedEntity(item)
            setDialogMode('edit')
          }}
          onDelete={setDeleteTarget}
        />

        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value)
            setPage(1)
          }}
        />
      </div>

      <EntityFormDialog
        open={dialogMode !== null}
        mode={dialogMode ?? 'create'}
        entityType={entityType}
        initialValues={toFormValues(selectedEntity)}
        discoms={(discomsQuery.data?.items ?? []) as Discom[]}
        zones={(zonesQuery.data?.items ?? []) as Zone[]}
        verticals={(verticalsQuery.data?.items ?? []) as Vertical[]}
        backendError={formError}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setDialogMode(null)
          setSelectedEntity(null)
          setFormError(null)
        }}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmation
        open={Boolean(deleteTarget)}
        entityName={deleteTarget?.name ?? ''}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
