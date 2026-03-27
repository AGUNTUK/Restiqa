"use client";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#e2e8f0]/60 ${className}`}
      {...props}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="neo-card rounded-[24px] overflow-hidden flex flex-col h-full bg-white/40">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-5 flex-1 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-6 w-2/3 rounded-lg" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3 rounded-md" />
        <div className="pt-4 flex justify-between items-end border-t border-white/40">
           <div className="space-y-1">
             <Skeleton className="h-3 w-16" />
             <Skeleton className="h-6 w-20 rounded-lg" />
           </div>
           <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="neo-card p-6 rounded-[24px] space-y-4">
      <Skeleton className="h-3 w-20 uppercase" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}
