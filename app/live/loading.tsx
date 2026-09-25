export default function LiveLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 border-b border-surface-border/60 pb-4">
        <div className="h-8 w-56 rounded-xl bg-surface-muted"></div>
        <div className="h-4 w-72 rounded-lg bg-surface-muted/60"></div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col gap-4 py-2">
        <div className="h-10 w-full max-w-md rounded-2xl bg-surface-muted"></div>
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 shrink-0 rounded-full bg-surface-muted"
            ></div>
          ))}
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface/70"
          >
            <div className="aspect-video w-full bg-surface-muted relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/5 to-transparent animate-shimmer" />
            </div>
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 rounded-md bg-surface-muted"></div>
              <div className="flex gap-2">
                <div className="h-3 w-12 rounded bg-surface-muted"></div>
                <div className="h-3 w-8 rounded bg-surface-muted"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
