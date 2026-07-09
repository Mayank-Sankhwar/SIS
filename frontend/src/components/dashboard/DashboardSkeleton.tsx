import DashboardStatCard from './DashboardStatCard'
import { Activity } from 'lucide-react'

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <DashboardStatCard key={index} title="Loading" value="-" icon={Activity} trend="Loading" loading />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
            <div className="m-5 h-5 w-48 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mx-5 mt-10 h-48 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
