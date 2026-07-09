import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import type { Substation, SubstationApiError, SubstationFormValues, SubstationPayload } from '../../types/substation'
import type { Discom, SubVertical, Vertical, Zone } from '../../types/hierarchy'

type SubstationFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialSubstation?: Substation | null
  discoms: Discom[]
  zones: Zone[]
  verticals: Vertical[]
  subVerticals: SubVertical[]
  backendError?: SubstationApiError | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: SubstationPayload) => void
}

const schema = z.object({
  discomId: z.string().optional(),
  zoneId: z.string().optional(),
  verticalId: z.string().optional(),
  subVerticalId: z.string().optional(),
  name: z.string().trim().min(1, 'Name is required').max(150),
  code: z.string().trim().min(1, 'Code is required').max(50),
  voltageLevelKv: z.string().trim().min(1, 'Voltage level is required').refine((value) => Number(value) > 0, 'Voltage must be greater than 0'),
  address: z.string().optional(),
  latitude: z.string().optional().refine((value) => !value || (Number(value) >= -90 && Number(value) <= 90), 'Latitude must be between -90 and 90'),
  longitude: z.string().optional().refine((value) => !value || (Number(value) >= -180 && Number(value) <= 180), 'Longitude must be between -180 and 180'),
  commissioningDate: z.string().optional(),
  isActive: z.boolean(),
}).superRefine((value, context) => {
  if (!value.subVerticalId) {
    context.addIssue({ code: 'custom', path: ['subVerticalId'], message: 'Sub Vertical is required' })
  }
})

function dateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : ''
}

function toDefaults(substation?: Substation | null): SubstationFormValues {
  return {
    discomId: substation?.subVertical.vertical.zone.discom.id ?? '',
    zoneId: substation?.subVertical.vertical.zone.id ?? '',
    verticalId: substation?.subVertical.vertical.id ?? '',
    subVerticalId: substation?.subVertical.id ?? '',
    name: substation?.name ?? '',
    code: substation?.code ?? '',
    voltageLevelKv: substation?.voltageLevelKv ? String(substation.voltageLevelKv) : '',
    address: substation?.address ?? '',
    latitude: substation?.latitude !== null && substation?.latitude !== undefined ? String(substation.latitude) : '',
    longitude: substation?.longitude !== null && substation?.longitude !== undefined ? String(substation.longitude) : '',
    commissioningDate: dateInputValue(substation?.commissioningDate),
    isActive: substation?.isActive ?? true,
  }
}

function apiMessage(error?: SubstationApiError | null) {
  return error?.response?.data?.details?.formErrors?.[0] ?? error?.response?.data?.message ?? null
}

function fieldError(error: SubstationApiError | null | undefined, field: string) {
  return error?.response?.data?.details?.fieldErrors?.[field]?.[0]
}

export default function SubstationFormDialog({
  open,
  mode,
  initialSubstation,
  discoms,
  zones,
  verticals,
  subVerticals,
  backendError,
  isSubmitting,
  onClose,
  onSubmit,
}: SubstationFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubstationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(initialSubstation),
  })

  useEffect(() => {
    if (open) reset(toDefaults(initialSubstation))
  }, [initialSubstation, open, reset])

  const discomId = useWatch({ control, name: 'discomId' })
  const zoneId = useWatch({ control, name: 'zoneId' })
  const verticalId = useWatch({ control, name: 'verticalId' })

  if (!open) return null

  const filteredZones = zones.filter((zone) => !discomId || zone.discomId === discomId)
  const filteredVerticals = verticals.filter((vertical) => !zoneId || vertical.zoneId === zoneId)
  const filteredSubVerticals = subVerticals.filter((subVertical) => !verticalId || subVertical.verticalId === verticalId)
  const message = apiMessage(backendError)
  const hierarchyDisabled = mode === 'edit'

  const submit = (values: SubstationFormValues) => {
    const payload: SubstationPayload = {
      ...(mode === 'create' ? { subVerticalId: values.subVerticalId } : {}),
      name: values.name.trim(),
      code: values.code.trim(),
      voltageLevelKv: Number(values.voltageLevelKv),
      ...(values.address?.trim() ? { address: values.address.trim() } : {}),
      ...(values.latitude ? { latitude: Number(values.latitude) } : {}),
      ...(values.longitude ? { longitude: Number(values.longitude) } : {}),
      ...(values.commissioningDate ? { commissioningDate: values.commissioningDate } : {}),
      isActive: values.isActive,
    }
    onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit(submit)} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">{mode === 'create' ? 'Create Substation' : 'Edit Substation'}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Maintain substation master and GIS information.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-900" aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          {message ? <div className="md:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">{message}</div> : null}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Discom</span>
            <select {...register('discomId')} disabled={hierarchyDisabled} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900">
              <option value="">Select Discom</option>
              {discoms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Zone</span>
            <select {...register('zoneId')} disabled={hierarchyDisabled} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900">
              <option value="">Select Zone</option>
              {filteredZones.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Vertical</span>
            <select {...register('verticalId')} disabled={hierarchyDisabled} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900">
              <option value="">Select Vertical</option>
              {filteredVerticals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Sub Vertical</span>
            <select {...register('subVerticalId')} disabled={hierarchyDisabled} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900">
              <option value="">Select Sub Vertical</option>
              {filteredSubVerticals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <span className="mt-1 block text-xs text-red-600">{errors.subVerticalId?.message ?? fieldError(backendError, 'subVerticalId')}</span>
          </label>

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

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Voltage Level KV</span>
            <input {...register('voltageLevelKv')} type="number" step="0.01" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <span className="mt-1 block text-xs text-red-600">{errors.voltageLevelKv?.message ?? fieldError(backendError, 'voltageLevelKv')}</span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Commissioning Date</span>
            <input {...register('commissioningDate')} type="date" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Address</span>
            <textarea {...register('address')} rows={3} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Latitude</span>
            <input {...register('latitude')} type="number" step="0.000001" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <span className="mt-1 block text-xs text-red-600">{errors.latitude?.message ?? fieldError(backendError, 'latitude')}</span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Longitude</span>
            <input {...register('longitude')} type="number" step="0.000001" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <span className="mt-1 block text-xs text-red-600">{errors.longitude?.message ?? fieldError(backendError, 'longitude')}</span>
          </label>

          <label className="flex items-center gap-2 md:col-span-2">
            <input {...register('isActive')} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active</span>
          </label>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <button type="button" onClick={onClose} className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500">{isSubmitting ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
