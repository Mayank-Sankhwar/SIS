import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, PlayCircle, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import ExcelUploadZone from '../../components/imports/ExcelUploadZone'
import ImportErrorsTable from '../../components/imports/ImportErrorsTable'
import ImportHistoryTable from '../../components/imports/ImportHistoryTable'
import ImportProgressDialog from '../../components/imports/ImportProgressDialog'
import ValidationResultCard from '../../components/imports/ValidationResultCard'
import WorkbookSummaryCard from '../../components/imports/WorkbookSummaryCard'
import { useAuth } from '../../contexts/AuthContext'
import { useImportWorkbook, useValidateWorkbook } from '../../hooks/useImports'
import type { ImportApiError, ImportExecutionResponse, ImportHistoryEntry, ImportMode, ImportValidationResponse } from '../../types/imports'

const supportedSheets = [
  'Discoms',
  'Zones',
  'Verticals',
  'Sub Verticals',
  'Substations',
  'Incoming Sources',
  'Outgoing Feeders',
  'Transformers',
  'Lightning Arresters',
  'Battery Banks',
  'Capacitor Banks',
]

const templateLines = [
  ['Sheet', 'Headers'],
  ['Discoms', 'Name | Code'],
  ['Zones', 'Discom Code | Name | Code'],
  ['Verticals', 'Zone Code | Name | Code'],
  ['Sub Verticals', 'Vertical Code | Name | Code'],
  ['Substations', 'Sub Vertical Code | Name | Code | Voltage Level KV | Address | Latitude | Longitude | Commissioning Date | Is Active'],
  ['Incoming Sources', 'Substation Code | Source Name | Source Type | Voltage Level KV | Feeder Name | Meter Number | Is Active'],
  ['Outgoing Feeders', 'Substation Code | Feeder Name | Feeder Code | Voltage Level KV | Feeder Type | Connected Load MW | Is Active'],
  ['Transformers', 'Substation Code | Transformer Code | Capacity MVA | Primary Voltage KV | Secondary Voltage KV | Make | Serial Number | Commissioning Date | Is Active'],
  ['Lightning Arresters', 'Substation Code | Arrester Code | Location Description | Voltage Rating KV | Make | Serial Number | Installation Date | Is Active'],
  ['Battery Banks', 'Substation Code | Battery Bank Code | Battery Type | Voltage V | Capacity Ah | Cell Count | Make | Installation Date | Is Active'],
  ['Capacitor Banks', 'Substation Code | Capacitor Bank Code | Capacity MVAR | Voltage Level KV | Steps Count | Make | Installation Date | Is Active'],
]

function errorMessage(error: unknown) {
  const apiError = error as ImportApiError
  return apiError.response?.data?.message ?? apiError.message ?? 'Request failed'
}

function historyFromValidation(result: ImportValidationResponse, userName: string): ImportHistoryEntry {
  return {
    id: result.importJob.id,
    status: result.importJob.status,
    user: userName,
    time: new Date().toLocaleString('en-IN'),
    executionTimeMs: null,
    rows: result.workbookSummary.totalRows,
    fileName: result.uploadedFile.originalFileName,
  }
}

function historyFromImport(result: ImportExecutionResponse, userName: string): ImportHistoryEntry {
  return {
    id: result.importJob.id,
    status: result.importJob.status,
    user: userName,
    time: new Date().toLocaleString('en-IN'),
    executionTimeMs: result.summary.executionTimeMs,
    rows: result.summary.rowsRead,
    fileName: result.uploadedFile.originalFileName,
  }
}

export default function ExcelImportPage() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [uploadedAt, setUploadedAt] = useState<Date | null>(null)
  const [validationResult, setValidationResult] = useState<ImportValidationResponse | null>(null)
  const [importResult, setImportResult] = useState<ImportExecutionResponse | null>(null)
  const [mode, setMode] = useState<ImportMode>('UPSERT')
  const [history, setHistory] = useState<ImportHistoryEntry[]>([])
  const [lastError, setLastError] = useState<string | null>(null)
  const validateMutation = useValidateWorkbook()
  const importMutation = useImportWorkbook()

  const busy = validateMutation.isPending || importMutation.isPending
  const latestErrors = importResult?.summary.validationErrors ?? validationResult?.validationErrors ?? []
  const lastImportTime = history[0]?.time ?? 'No imports yet'

  const canImport = Boolean(file && validationResult?.isValid)

  const templateCsv = useMemo(
    () => templateLines.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n'),
    [],
  )

  const downloadTemplateReference = () => {
    const blob = new Blob([templateCsv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sis-import-template-reference.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const selectFile = (nextFile: File) => {
    setFile(nextFile)
    setUploadedAt(new Date())
    setValidationResult(null)
    setImportResult(null)
    setLastError(null)
  }

  const validate = () => {
    if (!file) return
    setLastError(null)
    validateMutation.mutate(file, {
      onSuccess: (result) => {
        setValidationResult(result)
        setImportResult(null)
        setHistory((current) => [historyFromValidation(result, user?.name ?? 'Current User'), ...current])
        toast.success('Workbook validation completed')
      },
      onError: (error) => setLastError(errorMessage(error)),
    })
  }

  const executeImport = () => {
    if (!file) return
    setLastError(null)
    importMutation.mutate(
      { file, mode },
      {
        onSuccess: (result) => {
          setImportResult(result)
          setValidationResult(result)
          setHistory((current) => [historyFromImport(result, user?.name ?? 'Current User'), ...current])
          toast.success('Workbook import completed')
        },
        onError: (error) => setLastError(errorMessage(error)),
      },
    )
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mx-auto max-w-[1800px] space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Imports / Excel</p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl dark:text-white">Excel Import</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">Validate and import official Substation Information System workbooks using the backend import engine.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Last Import Time</p>
              <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{lastImportTime}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <FileSpreadsheet className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">Download Template</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Use the official workbook structure with required sheet names and enforced header order. Template version: SIS Import v1.</p>
              </div>
            </div>
            <button type="button" onClick={downloadTemplateReference} className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500">
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Excel Template
            </button>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Supported Sheets</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {supportedSheets.map((sheet) => <span key={sheet} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{sheet}</span>)}
              </div>
            </div>
          </div>
          <ExcelUploadZone file={file} uploadedAt={uploadedAt} disabled={busy} onFileSelect={selectFile} onRemove={() => { setFile(null); setUploadedAt(null); setValidationResult(null); setImportResult(null) }} />
        </section>

        {lastError ? <ErrorState title="Import request failed" description={lastError} onRetry={validationResult ? executeImport : validate} /> : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <WorkbookSummaryCard result={validationResult} />
          <ValidationResultCard result={validationResult} />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">Validate and Import</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Validate first, then import with the desired write mode.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={!file || busy} onClick={validate} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Validate Workbook
              </button>
              <select value={mode} onChange={(event) => setMode(event.target.value as ImportMode)} disabled={busy} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <option value="UPSERT">UPSERT</option>
                <option value="INSERT_ONLY">INSERT_ONLY</option>
              </select>
              <button type="button" disabled={!canImport || busy} onClick={executeImport} className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500">
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                Import
              </button>
            </div>
          </div>
          {!file ? <div className="mt-5"><EmptyState title="No file selected" description="Upload an `.xlsx` workbook to enable validation." /></div> : null}
        </section>

        {importResult ? (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-emerald-900/70 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              {importResult.summary.rowsFailed > 0 ? <AlertCircle className="h-6 w-6 text-amber-700 dark:text-amber-300" /> : <CheckCircle2 className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />}
              <div>
                <h2 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">Import Result</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Job ID: {importResult.importJob.id} - Uploaded File: {importResult.uploadedFile.originalFileName}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ['Imported', importResult.summary.rowsImported],
                ['Updated', importResult.summary.rowsUpdated],
                ['Failed', importResult.summary.rowsFailed],
                ['Execution Time', `${importResult.summary.executionTimeMs} ms`],
                ['Rows Read', importResult.summary.rowsRead],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <ImportErrorsTable errors={latestErrors} />
        <ImportHistoryTable entries={history} />
      </div>
      <ImportProgressDialog open={busy} title={validateMutation.isPending ? 'Validating workbook' : 'Importing workbook'} description="Please wait while the backend processes the uploaded Excel file." />
    </div>
  )
}
