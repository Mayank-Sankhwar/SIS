export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-lg rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Access Denied</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">You are not authorized</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Your session is valid, but this account does not have access to the requested area.
        </p>
      </div>
    </div>
  )
}
