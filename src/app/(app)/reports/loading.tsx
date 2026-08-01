import {
  CardGridSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/skeletons/PageSkeletons";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} />
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
