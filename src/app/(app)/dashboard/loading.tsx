import {
  ChartSkeleton,
  PageHeaderSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/skeletons/PageSkeletons";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartSkeleton height={280} />
        <ChartSkeleton height={280} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TableSkeleton rows={4} cols={4} />
        <TableSkeleton rows={4} cols={4} />
      </div>
    </div>
  );
}
