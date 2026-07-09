import type { LucideIcon } from 'lucide-react'

type QuickActionCardProps = {
  title: string
  description: string
  icon: LucideIcon
  onClick?: () => void
}

export default function QuickActionCard({ title, description, icon: Icon, onClick }: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900 dark:hover:bg-slate-950"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/50 dark:text-blue-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-950 dark:text-white">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</span>
      </span>
    </button>
  )
}
