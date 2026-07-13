import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createUser, listUsers } from '../api/users'
import type { CreateUserPayload } from '../types/user'

export const userQueryKeys = {
  all: ['users'] as const,
  lists: (params: Record<string, string | number | undefined>) => [...userQueryKeys.all, 'list', params] as const,
}

export function useUsers(params: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: userQueryKeys.lists(params),
    queryFn: () => listUsers(params),
    placeholderData: (previous) => previous,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
    },
  })
}
