import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons/PageSkeletons";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <Card className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </Card>
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Card className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </Card>
    </div>
  );
}
