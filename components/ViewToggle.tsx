"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ViewToggle({ dict }: { dict: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "list";

  const toggleView = () => {
    const params = new URLSearchParams(searchParams.toString());
    const newView = currentView === "list" ? "map" : "list";
    params.set("view", newView);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 lg:hidden text-nowrap">
      <button
        onClick={toggleView}
        className="neo-btn bg-[#1a202c] text-white px-6 py-3.5 rounded-full font-extrabold text-sm shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border border-white/20 whitespace-nowrap"
      >
        {currentView === "list" ? (
          <>
            <span>🗺️</span> {dict?.filters?.showMap || "Show Map"}
          </>
        ) : (
          <>
            <span>📋</span> {dict?.filters?.showList || "Show List"}
          </>
        )}
      </button>
    </div>
  );
}
