import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, ShieldCheck, UserCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'

const loginSchema = z.object({
  email: z.string().email('Enter a valid official email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const onSubmit = async (values: LoginFormValues) => {
    await login(values.email, values.password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.04),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] p-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200">
              <ShieldCheck className="h-4 w-4" />
              KESCO Secure Access
            </div>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight">
              Substation Information System
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
              A secure operational platform for substations, equipment, and field reporting.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Authorized Personnel Only
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Access is restricted to approved officials and operational users.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Sign in
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Official Login</h2>
            </div>
            <div className="rounded-full bg-slate-100 p-3 text-slate-700">
              <UserCircle2 className="h-7 w-7" />
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                Official Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-900 caret-slate-900 focus:border-slate-900 focus:bg-white dark:text-slate-100 dark:placeholder:text-slate-900 dark:caret-slate-100"
                  placeholder="name@kesco.gov.in"
                  {...register('email')}
                />
              </div>
              {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 caret-slate-900 focus:border-slate-500 focus:bg-white dark:text-slate-100 dark:placeholder:text-slate-500 dark:caret-slate-100"
                  placeholder="Enter your password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? <p className="mt-2 text-sm text-red-600">{errors.password.message}</p> : null}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                Remember this device
              </label>
              <Link to="/forgot-password" className="font-medium text-slate-700 hover:text-slate-900">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800" disabled={isLoading || isSubmitting}>
              {isLoading || isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Lock className="h-4 w-4" />
              Secure authentication via backend-issued JWT
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
