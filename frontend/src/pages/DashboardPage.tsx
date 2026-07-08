export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Secure Workspace</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This placeholder protected page confirms the authenticated route is active.
        </p>
      </div>
    </div>
  )
}
