import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createEquipment, deleteEquipment, getEquipment, listEquipment, updateEquipment } from '../api/equipment'
import type { EquipmentEntity, EquipmentListParams, EquipmentListResponse, EquipmentPayload, EquipmentType } from '../types/equipment'

export const equipmentQueryKeys = {
  all: ['equipment'] as const,
  lists: (type: EquipmentType) => [...equipmentQueryKeys.all, type, 'list'] as const,
  list: (type: EquipmentType, params: EquipmentListParams) => [...equipmentQueryKeys.lists(type), params] as const,
  detail: (type: EquipmentType, id: string) => [...equipmentQueryKeys.all, type, 'detail', id] as const,
}

export function useEquipmentList(type: EquipmentType, endpoint: string, params: EquipmentListParams) {
  return useQuery({
    queryKey: equipmentQueryKeys.list(type, params),
    queryFn: () => listEquipment(endpoint, params),
    placeholderData: (previous) => previous,
  })
}

export function useEquipmentDetail(type: EquipmentType, endpoint: string, id: string | null) {
  return useQuery({
    queryKey: id ? equipmentQueryKeys.detail(type, id) : [...equipmentQueryKeys.all, type, 'detail', 'none'],
    queryFn: () => getEquipment(endpoint, id!),
    enabled: Boolean(id),
  })
}

export function useCreateEquipment(type: EquipmentType, endpoint: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EquipmentPayload) => createEquipment(endpoint, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.lists(type) }),
  })
}

export function useUpdateEquipment(type: EquipmentType, endpoint: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EquipmentPayload }) => updateEquipment(endpoint, id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: equipmentQueryKeys.lists(type) })
      const previous = queryClient.getQueriesData<EquipmentListResponse>({ queryKey: equipmentQueryKeys.lists(type) })
      for (const [key, data] of previous) {
        if (!data) continue
        queryClient.setQueryData<EquipmentListResponse>(key, {
          ...data,
          data: data.data.map((item: EquipmentEntity) => (item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item)),
        })
      }
      return { previous }
    },
    onError: (_error, _variables, context) => context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data)),
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.lists(type) })
      void queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.detail(type, variables.id) })
    },
  })
}

export function useDeleteEquipment(type: EquipmentType, endpoint: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEquipment(endpoint, id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.lists(type) }),
  })
}
