import EmptyState from '../EmptyState/EmptyState'
import type { ImportHistoryEntry } from '../../types/imports'

type ImportHistoryTableProps = {
  entries: ImportHistoryEntry[]
}

export default function ImportHistoryTable({ entries }: ImportHistoryTableProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-base font-semibold tracking-normal text-slate-950 dark:text-white">Import History</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recent uploads from this active import session.</p>
      </div>
      {entries.length === 0 ? (
        <div className="p-5">
          <EmptyState title="No recent uploads" description="Validation and import activity will appear here after API calls complete." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/70">
              <tr>
                {['Status', 'User', 'Time', 'Execution Time', 'Rows', 'Uploaded File'].map((header) => (
                  <th key={header} className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                  <td className="whitespace-nowrap px-5 py-4"><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{entry.status}</span></td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{entry.user}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{entry.time}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{entry.executionTimeMs === null ? '-' : `${entry.executionTimeMs} ms`}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">{entry.rows}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{entry.fileName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
