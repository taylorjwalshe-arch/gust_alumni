export default function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 border border-border p-4 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted h-8 w-8" />
            <div className="flex flex-col gap-1 w-full">
              <div className="h-3 w-1/4 bg-muted rounded" />
              <div className="h-3 w-1/6 bg-muted rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-11/12 bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
