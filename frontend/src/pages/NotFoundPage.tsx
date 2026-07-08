export default function NotFoundPage() {
  return (
    <section className="flex min-h-screen items-center justify-center p-8">
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested route is not available yet.
        </p>
      </div>
    </section>
  )
}
