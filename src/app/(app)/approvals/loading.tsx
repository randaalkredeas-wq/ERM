import { Skeleton } from "@/components/ui/Skeleton";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/skeletons/PageSkeletons";

export default function ApprovalsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-10 w-64 rounded-xl" />
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
