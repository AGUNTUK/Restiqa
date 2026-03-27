"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DynamicListingsMap } from "./LazyWrappers";
import { type ListingWithStats } from "@/lib/types/database";

export default function MapFilterHandler({ listings }: { listings: ListingWithStats[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBoundsChange = useCallback((bounds: any) => {
    if (!bounds) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("swLat", bounds.sw.lat.toFixed(4));
    params.set("swLng", bounds.sw.lng.toFixed(4));
    params.set("neLat", bounds.ne.lat.toFixed(4));
    params.set("neLng", bounds.ne.lng.toFixed(4));

    // Update URL without full page reload
    router.replace(`/listings?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <div className="sticky top-24 h-full w-full rounded-[32px] overflow-hidden shadow-2xl border border-white/20">
      <DynamicListingsMap listings={listings} onBoundsChange={handleBoundsChange} />
    </div>
  );
}
