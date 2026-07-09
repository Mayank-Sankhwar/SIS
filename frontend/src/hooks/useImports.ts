import { useMutation } from '@tanstack/react-query'

import { importWorkbook, validateWorkbook } from '../api/imports'
import type { ImportMode } from '../types/imports'

export function useValidateWorkbook() {
  return useMutation({
    mutationFn: (file: File) => validateWorkbook(file),
  })
}

export function useImportWorkbook() {
  return useMutation({
    mutationFn: ({ file, mode }: { file: File; mode: ImportMode }) => importWorkbook(file, mode),
  })
}
