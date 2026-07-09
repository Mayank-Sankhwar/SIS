import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'

import type { EquipmentApiError, EquipmentConfig, EquipmentEntity, EquipmentPayload } from '../../types/equipment'
import type { Substation } from '../../types/substation'

type EquipmentFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  config: EquipmentConfig
  item: EquipmentEntity | null
  substations: Substation[]
  error?: EquipmentApiError | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: EquipmentPayload) => void
}

type FormValues = Record<string, string | boolean>

function schemaFor(config: EquipmentConfig, mode: 'create' | 'edit') {
  const shape: Record<string, z.ZodTypeAny> = {
    substationId: mode === 'create' ? z.string().min(1, 'Substation is required') : z.string().optional(),
    isActive: z.boolean(),
  }
  for (const field of config.fields) {
    if (mode === 'edit' && field.readOnlyOnEdit) continue
    if (field.type === 'number') {
      shape[field.name] = field.required
        ? z.string().trim().min(1, `${field.label} is required`).refine((value: string) => Number.isFinite(Number(value)), `${field.label} must be a valid number`)
        : z.string().optional().refine((value: string | undefined) => !value || Number.isFinite(Number(value)), `${field.label} must be a valid number`)
    } else {
      shape[field.name] = field.required ? z.string().trim().min(1, `${field.label} is required`) : z.string().optional()
    }
  }
  return z.object(shape)
}

function defaults(config: EquipmentConfig, mode: 'create' | 'edit', item: EquipmentEntity | null): FormValues {
  const values: FormValues = { substationId: item?.substationId ?? '', isActive: item?.isActive ?? true }
  for (const field of config.fields) {
    if (mode === 'edit' && field.readOnlyOnEdit) continue
    const value = item?.[field.name]
    values[field.name] = field.type === 'date' && typeof value === 'string' ? value.slice(0, 10) : value === null || value === undefined ? '' : String(value)
  }
  return values
}

function apiMessage(error?: EquipmentApiError | null) {
  return error?.response?.data?.details?.formErrors?.[0] ?? error?.response?.data?.message ?? null
}

function fieldError(error: EquipmentApiError | null | undefined, field: string) {
  return error?.response?.data?.details?.fieldErrors?.[field]?.[0]
}

export default function EquipmentFormDialog({ open, mode, config, item, substations, error, isSubmitting, onClose, onSubmit }: EquipmentFormDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schemaFor(config, mode)) as Resolver<FormValues>,
    defaultValues: defaults(config, mode, item),
  })

  useEffect(() => {
    if (open) reset(defaults(config, mode, item))
  }, [config, item, mode, open, reset])

  if (!open) return null

  const submit = (values: FormValues) => {
    const payload: EquipmentPayload = {}
    if (mode === 'create') payload.substationId = values.substationId as string
    for (const field of config.fields) {
      if (mode === 'edit' && field.readOnlyOnEdit) continue
      const value = values[field.name]
      if (value === '' || value === undefined) continue
      payload[field.name] = field.type === 'number' ? Number(value) : value as string
    }
    payload.isActive = Boolean(values.isActive)
    onSubmit(payload)
  }

  const message = apiMessage(error)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit(submit)} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <div><h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">{mode === 'create' ? 'Create' : 'Edit'} {config.title}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter equipment master data.</p></div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {message ? <div className="md:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">{message}</div> : null}
          {mode === 'create' ? (
            <label className="block md:col-span-2"><span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Substation</span><select {...register('substationId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"><option value="">Select Substation</option>{substations.map((substation) => <option key={substation.id} value={substation.id}>{substation.name}</option>)}</select><span className="mt-1 block text-xs text-red-600">{errors.substationId?.message?.toString() ?? fieldError(error, 'substationId')}</span></label>
          ) : null}
          {config.fields.filter((field) => !(mode === 'edit' && field.readOnlyOnEdit)).map((field) => (
            <label key={field.name} className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">{field.label}</span>
              <input {...register(field.name)} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} min={field.min} step={field.step} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              <span className="mt-1 block text-xs text-red-600">{errors[field.name]?.message?.toString() ?? fieldError(error, field.name)}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 md:col-span-2"><input {...register('isActive')} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active</span></label>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"><button type="button" onClick={onClose} className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">Cancel</button><button type="submit" disabled={isSubmitting} className="h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500">{isSubmitting ? 'Saving...' : 'Save'}</button></div>
      </form>
    </div>
  )
}
