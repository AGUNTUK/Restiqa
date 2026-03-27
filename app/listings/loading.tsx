import { ListingCardSkeleton, Skeleton } from "@/components/Skeleton";

export default function ListingsLoading() {
  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        
        {/* Left Side: Listings */}
        <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col">
          <div className="mb-8 space-y-3">
            <Skeleton className="h-12 w-1/2 rounded-2xl" />
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>

          {/* Filter Placeholder */}
          <div className="neo-card p-6 rounded-[32px] mb-10 h-32 flex items-center gap-6">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Right Side: Map sticky placeholder */}
        <div className="hidden lg:block lg:w-[45%] xl:w-[40%]">
          <Skeleton className="sticky top-24 h-[calc(100vh-140px)] w-full rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}
