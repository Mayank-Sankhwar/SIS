import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '../../components/ui/button'

const forgotSchema = z.object({
  email: z.string().email('Enter a valid official email address'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async () => {
    // Backend endpoint is not currently available for this flow; form is kept ready for future support.
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <div className="rounded-full bg-slate-100 p-3 text-slate-700">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Recovery</p>
            <h1 className="text-2xl font-semibold text-slate-900">Forgot Password</h1>
          </div>
        </div>
        <p className="mt-5 text-sm leading-7 text-slate-600">
          Use this screen to initiate password recovery when the backend enables a dedicated reset endpoint.
        </p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
              Official Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
              placeholder="name@kesco.gov.in"
              {...register('email')}
            />
            {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
          </div>
          <Button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Request'}
          </Button>
        </form>
      </div>
    </div>
  )
}
