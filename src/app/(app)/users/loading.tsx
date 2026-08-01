import {
  PageHeaderSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/skeletons/PageSkeletons";

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <TableSkeleton rows={7} cols={5} />
    </div>
  );
}
