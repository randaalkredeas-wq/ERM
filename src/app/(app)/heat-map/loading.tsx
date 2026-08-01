import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/skeletons/PageSkeletons";

export default function HeatMapLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Skeleton className="aspect-square w-full max-w-xl rounded-xl" />
        </Card>
        <Card className="space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </Card>
      </div>
    </div>
  );
}
