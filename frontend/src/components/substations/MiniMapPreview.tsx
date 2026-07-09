import { ExternalLink, MapPin } from 'lucide-react'

type MiniMapPreviewProps = {
  latitude: number | null
  longitude: number | null
}

export default function MiniMapPreview({ latitude, longitude }: MiniMapPreviewProps) {
  if (latitude === null || longitude === null) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-900">
        <div>
          <MapPin className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Coordinates not available</p>
        </div>
      </div>
    )
  }

  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(226,232,240,0.78))] dark:border-slate-800 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.82))]">
      <div className="relative min-h-44 bg-[linear-gradient(to_right,rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.2)_1px,transparent_1px)] bg-[size:36px_36px]">
        <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-blue-700 text-white shadow-[0_14px_30px_rgba(29,78,216,0.32)]">
          <MapPin className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-3 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {latitude}, {longitude}
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Open
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
