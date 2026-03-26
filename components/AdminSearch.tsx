"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent, Suspense } from "react";

function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const [query, setQuery] = useState(searchParams.get("q")?.toString() || "");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    // We replace the current URL to avoid massive browser history stacks when searching
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 w-full max-w-sm relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8bc1c1] focus:border-transparent text-sm transition-all text-[#1a202c] placeholder:text-gray-400 appearance-none"
        placeholder={placeholder}
      />
      <button type="submit" className="hidden">Search</button>
    </form>
  );
}

export default function AdminSearch({ placeholder = "Search..." }: { placeholder?: string }) {
  // Wrap with Suspense so it doesn't de-opt entire pages into Client-Side rendering on first paint
  return (
    <Suspense fallback={
        <div className="flex-1 w-full max-w-sm h-10 bg-gray-100 animate-pulse rounded-xl" />
    }>
      <SearchInput placeholder={placeholder} />
    </Suspense>
  );
}
