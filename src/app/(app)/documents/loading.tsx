import { Skeleton } from "@/components/ui/Skeleton";
import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/skeletons/PageSkeletons";

export default function DocumentsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <CardGridSkeleton count={8} />
    </div>
  );
}
