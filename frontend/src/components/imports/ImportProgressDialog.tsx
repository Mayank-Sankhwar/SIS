import { Loader2 } from 'lucide-react'

type ImportProgressDialogProps = {
  open: boolean
  title: string
  description: string
}

export default function ImportProgressDialog({ open, title, description }: ImportProgressDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-700 dark:text-blue-300" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  )
}
