export const PageSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className="h-14 animate-pulse rounded-2xl bg-slate-200/80"
      />
    ))}
  </div>
);
