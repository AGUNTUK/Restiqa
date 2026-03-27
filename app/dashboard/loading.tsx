import { DashboardStatSkeleton, Skeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header Skeleton */}
      <div className="neo-card rounded-[20px] p-7 mb-7 flex items-center gap-5">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
      </div>

      {/* Tab Control Skeleton */}
      <div className="neo-inset p-2 rounded-2xl flex gap-2 mb-8 mx-auto w-full max-w-md h-14">
        <Skeleton className="flex-1 rounded-xl" />
        <Skeleton className="flex-1 rounded-xl" />
        <Skeleton className="flex-1 rounded-xl" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-8">
        <section>
          <Skeleton className="h-6 w-40 mb-4 rounded-lg" />
          <div className="neo-card rounded-[20px] p-7 h-48">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        </section>

        <section>
          <Skeleton className="h-6 w-32 mb-4 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
          </div>
        </section>
      </div>
    </div>
  );
}
