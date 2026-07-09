import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createSubstation,
  deleteSubstation,
  getSubstation,
  listSubstations,
  updateSubstation,
} from '../api/substations'
import type { Substation, SubstationListParams, SubstationListResponse, SubstationPayload } from '../types/substation'

export const substationQueryKeys = {
  all: ['substations'] as const,
  lists: () => [...substationQueryKeys.all, 'list'] as const,
  list: (params: SubstationListParams) => [...substationQueryKeys.lists(), params] as const,
  detail: (id: string) => [...substationQueryKeys.all, 'detail', id] as const,
}

export function useSubstations(params: SubstationListParams) {
  return useQuery({
    queryKey: substationQueryKeys.list(params),
    queryFn: () => listSubstations(params),
    placeholderData: (previous) => previous,
  })
}

export function useSubstation(id: string | null) {
  return useQuery({
    queryKey: id ? substationQueryKeys.detail(id) : [...substationQueryKeys.all, 'detail', 'none'],
    queryFn: () => getSubstation(id!),
    enabled: Boolean(id),
  })
}

export function useCreateSubstation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSubstation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: substationQueryKeys.lists() })
    },
  })
}

export function useUpdateSubstation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubstationPayload }) => updateSubstation(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: substationQueryKeys.lists() })
      const previous = queryClient.getQueriesData<SubstationListResponse>({ queryKey: substationQueryKeys.lists() })

      for (const [key, data] of previous) {
        if (!data) continue
        queryClient.setQueryData<SubstationListResponse>(key, {
          ...data,
          data: data.data.map((item: Substation) => (item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item)),
        })
      }

      return { previous }
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: substationQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: substationQueryKeys.detail(variables.id) })
    },
  })
}

export function useDeleteSubstation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSubstation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: substationQueryKeys.lists() })
    },
  })
}
