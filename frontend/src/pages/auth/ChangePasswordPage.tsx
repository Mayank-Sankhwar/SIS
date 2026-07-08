import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '../../components/ui/button'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export default function ChangePasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async () => {
    // Backend endpoint is not currently available for this flow; form is ready for future support.
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Return to dashboard
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <div className="rounded-full bg-slate-100 p-3 text-slate-700">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Security</p>
            <h1 className="text-2xl font-semibold text-slate-900">Change Password</h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-7 text-slate-600">
          Use this screen when the backend exposes a password change endpoint for the authenticated user.
        </p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="currentPassword">
              Current Password
            </label>
            <input id="currentPassword" type="password" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white" {...register('currentPassword')} />
            {errors.currentPassword ? <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="newPassword">
              New Password
            </label>
            <input id="newPassword" type="password" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white" {...register('newPassword')} />
            {errors.newPassword ? <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input id="confirmPassword" type="password" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white" {...register('confirmPassword')} />
            {errors.confirmPassword ? <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p> : null}
          </div>
          <Button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800" disabled={isSubmitting}>
            {isSubmitting ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
