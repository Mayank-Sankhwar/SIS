import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type {
  BackendApiError,
  Discom,
  HierarchyEntityType,
  HierarchyFormValues,
  Vertical,
  Zone,
} from '../../types/hierarchy'

type EntityFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  entityType: HierarchyEntityType
  initialValues?: HierarchyFormValues
  discoms?: Discom[]
  zones?: Zone[]
  verticals?: Vertical[]
  backendError?: BackendApiError | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (values: HierarchyFormValues) => void
}

const baseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150, 'Name must be 150 characters or fewer'),
  code: z.string().trim().min(1, 'Code is required').max(50, 'Code must be 50 characters or fewer'),
  discomId: z.string().optional(),
  zoneId: z.string().optional(),
  verticalId: z.string().optional(),
})

function schemaFor(entityType: HierarchyEntityType) {
  return baseSchema.superRefine((value, context) => {
    if (entityType === 'zones' && !value.discomId) {
      context.addIssue({ code: 'custom', path: ['discomId'], message: 'Discom is required' })
    }
    if (entityType === 'verticals' && !value.zoneId) {
      context.addIssue({ code: 'custom', path: ['zoneId'], message: 'Zone is required' })
    }
    if (entityType === 'sub-verticals' && !value.verticalId) {
      context.addIssue({ code: 'custom', path: ['verticalId'], message: 'Vertical is required' })
    }
  })
}

function backendMessage(error?: BackendApiError | null) {
  return error?.response?.data?.details?.formErrors?.[0] ?? error?.response?.data?.message ?? null
}

function fieldError(error: BackendApiError | null | undefined, field: string) {
  return error?.response?.data?.details?.fieldErrors?.[field]?.[0]
}

export default function EntityFormDialog({
  open,
  mode,
  entityType,
  initialValues,
  discoms = [],
  zones = [],
  verticals = [],
  backendError,
  isSubmitting = false,
  onClose,
  onSubmit,
}: EntityFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HierarchyFormValues>({
    resolver: zodResolver(schemaFor(entityType)),
    defaultValues: initialValues ?? { name: '', code: '', discomId: '', zoneId: '', verticalId: '' },
  })

  useEffect(() => {
    if (open) {
      reset(initialValues ?? { name: '', code: '', discomId: '', zoneId: '', verticalId: '' })
    }
  }, [initialValues, open, reset])

  if (!open) {
    return null
  }

  const title = `${mode === 'create' ? 'Create' : 'Edit'} ${entityType === 'sub-verticals' ? 'Sub Vertical' : entityType.slice(0, -1)}`
  const serverMessage = backendMessage(backendError)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter validated hierarchy master data.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {serverMessage ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
              {serverMessage}
            </div>
          ) : null}

          {entityType === 'zones' ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Discom</span>
              <select {...register('discomId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option value="">Select Discom</option>
                {discoms.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-red-600">{errors.discomId?.message ?? fieldError(backendError, 'discomId')}</span>
            </label>
          ) : null}

          {entityType === 'verticals' ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Zone</span>
              <select {...register('zoneId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option value="">Select Zone</option>
                {zones.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-red-600">{errors.zoneId?.message ?? fieldError(backendError, 'zoneId')}</span>
            </label>
          ) : null}

          {entityType === 'sub-verticals' ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Vertical</span>
              <select {...register('verticalId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option value="">Select Vertical</option>
                {verticals.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-red-600">{errors.verticalId?.message ?? fieldError(backendError, 'verticalId')}</span>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Name</span>
            <input {...register('name')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <span className="mt-1 block text-xs text-red-600">{errors.name?.message ?? fieldError(backendError, 'name')}</span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Code</span>
            <input {...register('code')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm uppercase dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <span className="mt-1 block text-xs text-red-600">{errors.code?.message ?? fieldError(backendError, 'code')}</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-5 dark:border-slate-800">
          <button type="button" onClick={onClose} className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500">
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
