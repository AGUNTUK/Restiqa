"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaginationControls({ totalItems, itemsPerPage }: { totalItems: number; itemsPerPage: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    // push allows back-button navigation for pagination usually
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  if (totalItems <= itemsPerPage && currentPage === 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 mx-6 md:mx-0 bg-white/40 p-4 rounded-2xl neo-card">
      <p className="text-sm font-bold text-[#a0aec0]">
        Showing <span className="text-[#4a5568]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-[#4a5568]">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-[#4a5568]">{totalItems}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-[#4a5568] border border-gray-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <div className="px-4 py-2 rounded-xl text-sm font-extrabold bg-[#1a202c] text-white shadow-sm flex items-center justify-center min-w-[3.5rem]">
          {currentPage}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-white text-[#4a5568] border border-gray-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function AdminPagination({ totalItems, itemsPerPage = 15 }: { totalItems: number; itemsPerPage?: number }) {
  return (
    <Suspense fallback={<div className="h-16 w-full animate-pulse bg-white/50 rounded-2xl mt-6 mx-6 md:mx-0"></div>}>
      <PaginationControls totalItems={totalItems} itemsPerPage={itemsPerPage} />
    </Suspense>
  );
}
