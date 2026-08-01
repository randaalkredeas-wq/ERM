import { Skeleton } from "@/components/ui/Skeleton";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/skeletons/PageSkeletons";

export default function AuditLogLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-10 w-full max-w-md rounded-xl" />
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
