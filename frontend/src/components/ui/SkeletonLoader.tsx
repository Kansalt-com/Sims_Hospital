import clsx from "clsx";

type SkeletonLoaderProps = {
  variant?: "table" | "cards" | "list" | "panel";
  rows?: number;
  columns?: number;
  className?: string;
};

const shimmerClass = "skeleton-block skeleton-shimmer";

export const SkeletonLoader = ({
  variant = "table",
  rows = 6,
  columns = 5,
  className,
}: SkeletonLoaderProps) => {
  if (variant === "cards") {
    return (
      <div className={clsx("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)} aria-label="Loading">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-[28px] border border-slate-200/70 bg-white/85 p-5 shadow-sm">
            <div className={clsx(shimmerClass, "h-10 w-10 rounded-2xl")} />
            <div className={clsx(shimmerClass, "mt-6 h-3 w-28 rounded-full")} />
            <div className={clsx(shimmerClass, "mt-3 h-8 w-24 rounded-2xl")} />
            <div className={clsx(shimmerClass, "mt-5 h-3 w-full rounded-full")} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={clsx("space-y-3", className)} aria-label="Loading">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm">
            <div className={clsx(shimmerClass, "h-4 w-32 rounded-full")} />
            <div className={clsx(shimmerClass, "mt-3 h-3 w-24 rounded-full")} />
            <div className={clsx(shimmerClass, "mt-4 h-8 w-20 rounded-full")} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "panel") {
    return (
      <div className={clsx("rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-sm", className)} aria-label="Loading">
        <div className={clsx(shimmerClass, "h-5 w-40 rounded-full")} />
        <div className={clsx(shimmerClass, "mt-6 h-4 w-full rounded-full")} />
        <div className={clsx(shimmerClass, "mt-3 h-4 w-10/12 rounded-full")} />
        <div className={clsx(shimmerClass, "mt-8 h-28 w-full rounded-[24px]")} />
      </div>
    );
  }

  return (
    <div className={clsx("overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm", className)} aria-label="Loading">
      <div className="border-b border-slate-200/80 bg-slate-50/80 px-5 py-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className={clsx(shimmerClass, "h-3 rounded-full")} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3 px-5 py-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className={clsx(
                  shimmerClass,
                  columnIndex === 0 ? "h-4 w-20 rounded-full" : "h-4 w-full rounded-full",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
