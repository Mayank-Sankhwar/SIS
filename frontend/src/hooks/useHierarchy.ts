import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createHierarchyEntity,
  deleteHierarchyEntity,
  listHierarchyEntities,
  updateHierarchyEntity,
} from '../api/hierarchy'
import type {
  CreateHierarchyPayload,
  HierarchyEntity,
  HierarchyEntityType,
  HierarchyListParams,
  PaginatedHierarchyResponse,
  UpdateHierarchyPayload,
} from '../types/hierarchy'

export const hierarchyQueryKeys = {
  all: ['hierarchy'] as const,
  lists: (type: HierarchyEntityType) => [...hierarchyQueryKeys.all, type, 'list'] as const,
  list: (type: HierarchyEntityType, params: HierarchyListParams) => [...hierarchyQueryKeys.lists(type), params] as const,
}

export function useHierarchyList<TType extends HierarchyEntityType>(type: TType, params: HierarchyListParams) {
  return useQuery({
    queryKey: hierarchyQueryKeys.list(type, params),
    queryFn: () => listHierarchyEntities(type, params),
    placeholderData: (previousData) => previousData,
  })
}

export function useCreateHierarchyEntity<TType extends HierarchyEntityType>(type: TType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateHierarchyPayload) => createHierarchyEntity(type, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hierarchyQueryKeys.lists(type) })
    },
  })
}

export function useUpdateHierarchyEntity<TType extends HierarchyEntityType>(type: TType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHierarchyPayload }) => updateHierarchyEntity(type, id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: hierarchyQueryKeys.lists(type) })
      const previousEntries = queryClient.getQueriesData<PaginatedHierarchyResponse<HierarchyEntity>>({
        queryKey: hierarchyQueryKeys.lists(type),
      })

      for (const [queryKey, data] of previousEntries) {
        if (!data) continue

        queryClient.setQueryData<PaginatedHierarchyResponse<HierarchyEntity>>(queryKey, {
          ...data,
          items: data.items.map((item) => (item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item)),
        })
      }

      return { previousEntries }
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: hierarchyQueryKeys.lists(type) })
    },
  })
}

export function useDeleteHierarchyEntity<TType extends HierarchyEntityType>(type: TType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteHierarchyEntity(type, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hierarchyQueryKeys.lists(type) })
    },
  })
}
