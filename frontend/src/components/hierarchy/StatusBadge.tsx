type StatusBadgeProps = {
  isActive: boolean
}

export default function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <span
      className={
        isActive
          ? 'inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
