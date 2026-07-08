type ErrorPageProps = {
  error?: Error
}

export default function ErrorPage({ error }: ErrorPageProps) {
  return (
    <section className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md rounded-xl border border-destructive/40 bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Error
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message ?? 'An unexpected error occurred.'}
        </p>
      </div>
    </section>
  )
}
