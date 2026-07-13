import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { BackendApiError, Discom, SubVertical, Vertical, Zone } from '../../types/hierarchy'
import type { UserAreaType, UserFormValues, UserRole } from '../../types/user'
import type { Substation } from '../../types/substation'

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'EE', label: 'Executive Engineer' },
  { value: 'AE', label: 'Assistant Engineer' },
  { value: 'JE', label: 'Junior Engineer' },
]

const areaTypeOptions: Array<{ value: UserAreaType; label: string }> = [
  { value: 'DISCOM', label: 'Discom' },
  { value: 'ZONE', label: 'Zone' },
  { value: 'VERTICAL', label: 'Vertical' },
  { value: 'SUB_VERTICAL', label: 'Sub Vertical' },
  { value: 'SUBSTATION', label: 'Substation' },
]

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(150),
  email: z.string().trim().email('Enter a valid email'),
  role: z.enum(['EE', 'AE', 'JE']),
  employeeId: z.string().trim().max(100).optional().or(z.literal('')),
  designation: z.string().trim().max(150).optional().or(z.literal('')),
  areaType: z.enum(['DISCOM', 'ZONE', 'VERTICAL', 'SUB_VERTICAL', 'SUBSTATION']),
  discomId: z.string().optional(),
  zoneId: z.string().optional(),
  verticalId: z.string().optional(),
  subVerticalId: z.string().optional(),
  substationId: z.string().optional(),
})

type UserFormDialogProps = {
  open: boolean
  isSubmitting?: boolean
  error?: BackendApiError | null
  discoms: Discom[]
  zones: Zone[]
  verticals: Vertical[]
  subVerticals: SubVertical[]
  substations: Substation[]
  onClose: () => void
  onSubmit: (values: UserFormValues) => void
}

function backendMessage(error?: BackendApiError | null) {
  return error?.response?.data?.message ?? null
}

function fieldError(error: BackendApiError | null | undefined, field: string) {
  return error?.response?.data?.details?.fieldErrors?.[field]?.[0]
}

export default function UserFormDialog({
  open,
  isSubmitting = false,
  error,
  discoms,
  zones,
  verticals,
  subVerticals,
  substations,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      role: 'EE',
      employeeId: '',
      designation: '',
      areaType: 'DISCOM',
      discomId: '',
      zoneId: '',
      verticalId: '',
      subVerticalId: '',
      substationId: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        email: '',
        role: 'EE',
        employeeId: '',
        designation: '',
        areaType: 'DISCOM',
        discomId: '',
        zoneId: '',
        verticalId: '',
        subVerticalId: '',
        substationId: '',
      })
    }
  }, [open, reset])

  const selectedAreaType = watch('areaType')
  const serverMessage = backendMessage(error)

  if (!open) return null

  const submitForm = (values: UserFormValues) => {
    onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit(submitForm)} className="w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">Create user</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create a new operational user and assign a primary reporting area.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white" aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {serverMessage ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">{serverMessage}</div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Name</span>
              <input {...register('name')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              <span className="mt-1 block text-xs text-red-600">{errors.name?.message ?? fieldError(error, 'name')}</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
              <input type="email" {...register('email')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              <span className="mt-1 block text-xs text-red-600">{errors.email?.message ?? fieldError(error, 'email')}</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Employee ID</span>
              <input {...register('employeeId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              <span className="mt-1 block text-xs text-red-600">{errors.employeeId?.message ?? fieldError(error, 'employeeId')}</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Designation</span>
              <input {...register('designation')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              <span className="mt-1 block text-xs text-red-600">{errors.designation?.message ?? fieldError(error, 'designation')}</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Role</span>
              <select {...register('role')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Area Type</span>
              <select {...register('areaType')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                {areaTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {selectedAreaType === 'DISCOM' ? (
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Discom</span>
                <select {...register('discomId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                  <option value="">Select Discom</option>
                  {discoms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            ) : null}
            {selectedAreaType === 'ZONE' ? (
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Zone</span>
                <select {...register('zoneId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                  <option value="">Select Zone</option>
                  {zones.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            ) : null}
            {selectedAreaType === 'VERTICAL' ? (
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Vertical</span>
                <select {...register('verticalId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                  <option value="">Select Vertical</option>
                  {verticals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            ) : null}
            {selectedAreaType === 'SUB_VERTICAL' ? (
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Sub Vertical</span>
                <select {...register('subVerticalId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                  <option value="">Select Sub Vertical</option>
                  {subVerticals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            ) : null}
            {selectedAreaType === 'SUBSTATION' ? (
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Substation</span>
                <select {...register('substationId')} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                  <option value="">Select Substation</option>
                  {substations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-5 dark:border-slate-800">
          <button type="button" onClick={onClose} className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500">{isSubmitting ? 'Creating...' : 'Create user'}</button>
        </div>
      </form>
    </div>
  )
}
