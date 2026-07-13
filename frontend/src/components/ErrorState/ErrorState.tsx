import { AlertCircle, RefreshCcw } from 'lucide-react'

type ErrorStateProps = {
  title?: string
  description?: string
  onRetry: () => void
  retryLabel?: string
}

export default function ErrorState({
  title = 'Unable to load dashboard',
  description = 'Please retry the request. If the issue continues, contact the system administrator.',
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  return (
    <section className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-red-900/70 dark:from-red-950/30 dark:to-rose-950/20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-700 shadow-sm ring-1 ring-red-100 dark:bg-slate-950 dark:text-red-300 dark:ring-red-900/60">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        <RefreshCcw className="h-4 w-4" aria-hidden="true" />
        {retryLabel}
      </button>
    </section>
  )
}
