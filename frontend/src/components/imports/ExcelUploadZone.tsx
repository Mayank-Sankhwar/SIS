import { FileSpreadsheet, UploadCloud, X } from 'lucide-react'

type ExcelUploadZoneProps = {
  file: File | null
  uploadedAt: Date | null
  disabled?: boolean
  onFileSelect: (file: File) => void
  onRemove: () => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ExcelUploadZone({ file, uploadedAt, disabled, onFileSelect, onRemove }: ExcelUploadZoneProps) {
  const handleFile = (candidate?: File) => {
    if (!candidate || disabled) return
    if (!candidate.name.toLowerCase().endsWith('.xlsx')) return
    onFileSelect(candidate)
  }

  return (
    <section
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        handleFile(event.dataTransfer.files[0])
      }}
      className="rounded-lg border border-dashed border-slate-300 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-950"
    >
      <div className="flex flex-col items-center justify-center rounded-lg bg-slate-50 px-6 py-10 text-center dark:bg-slate-900">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          <UploadCloud className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-semibold tracking-normal text-slate-950 dark:text-white">Upload Excel Workbook</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">Drag and drop a validated `.xlsx` workbook, or browse from your computer. Maximum supported size is 10 MB.</p>
        <label className="mt-5 inline-flex h-10 cursor-pointer items-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500">
          {file ? 'Replace file' : 'Choose .xlsx file'}
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={disabled}
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
      </div>

      {file ? (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
          <div className="flex min-w-0 items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{file.name}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatBytes(file.size)} · uploaded {uploadedAt?.toLocaleTimeString('en-IN')}</p>
            </div>
          </div>
          <button type="button" disabled={disabled} onClick={onRemove} className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/30">
            <X className="h-4 w-4" aria-hidden="true" />
            Remove
          </button>
        </div>
      ) : null}
    </section>
  )
}
