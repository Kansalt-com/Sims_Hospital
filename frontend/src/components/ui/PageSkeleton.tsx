import { SkeletonLoader } from "./SkeletonLoader";

export const PageSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <SkeletonLoader variant="table" rows={rows} columns={6} />
);
