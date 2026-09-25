export default function ChannelLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Top back button skeleton */}
      <div className="h-8 w-48 rounded-2xl bg-surface-muted" />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left col */}
        <div className="space-y-6 lg:col-span-2">
          {/* Player skeleton */}
          <div className="aspect-video w-full rounded-3xl bg-surface-muted relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/5 to-transparent animate-shimmer" />
          </div>

          {/* Info skeleton */}
          <div className="rounded-3xl border border-surface-border bg-surface/70 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-surface-muted" />
              <div className="space-y-2">
                <div className="h-6 w-48 rounded-md bg-surface-muted" />
                <div className="h-4 w-24 rounded bg-surface-muted/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <div className="h-6 w-40 rounded-lg bg-surface-muted" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-surface-muted" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
