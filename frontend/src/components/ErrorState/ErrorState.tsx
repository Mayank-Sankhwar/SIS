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
    <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-red-900/70 dark:bg-red-950/30">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-red-700 shadow-sm dark:bg-slate-950 dark:text-red-300">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        <RefreshCcw className="h-4 w-4" aria-hidden="true" />
        {retryLabel}
      </button>
    </section>
  )
}
