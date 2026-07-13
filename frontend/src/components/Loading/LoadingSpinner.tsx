export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-400" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading workspace…</p>
      </div>
    </div>
  )
}
