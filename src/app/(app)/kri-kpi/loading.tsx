import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/skeletons/PageSkeletons";

export default function KriKpiLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={8} />
    </div>
  );
}
