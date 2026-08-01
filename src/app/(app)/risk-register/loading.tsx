import {
  PageHeaderSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/skeletons/PageSkeletons";

export default function RiskRegisterLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <TableSkeleton rows={8} cols={7} />
    </div>
  );
}
