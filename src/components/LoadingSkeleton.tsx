// Loading skeleton components

/**
 * Skeleton loader for KPI cards
 */
export function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 bg-muted rounded-xl" />
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for charts
 */
export function ChartSkeleton({ height = '400px' }: { height?: string }) {
  return (
    <div
      className="w-full bg-muted/30 rounded-2xl animate-pulse flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-muted-foreground text-sm">กำลังโหลดข้อมูล...</div>
    </div>
  );
}

/**
 * Skeleton loader for tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-border">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-28 bg-muted rounded flex-1" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <div className="h-4 w-32 bg-muted/70 rounded" />
          <div className="h-4 w-40 bg-muted/70 rounded" />
          <div className="h-4 w-24 bg-muted/70 rounded" />
          <div className="h-4 w-28 bg-muted/70 rounded flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for KPI grid
 */
export function KPIGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Generic skeleton with custom dimensions
 */
export function Skeleton({
  width,
  height,
  className = '',
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-muted animate-pulse rounded ${className}`}
      style={{ width, height }}
    />
  );
}
