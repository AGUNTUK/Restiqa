"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="neo-card max-w-lg w-full p-10 md:p-16 rounded-[40px] text-center bg-white/80 backdrop-blur-md">
        <div className="w-20 h-20 bg-red-50 rounded-3xl shadow-sm flex items-center justify-center text-4xl mx-auto mb-8 border border-red-100">
          ⚠️
        </div>

        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-4 tracking-tight">
          System Hiccup
        </h1>
        <p className="text-[#718096] font-medium text-lg mb-10 max-w-sm mx-auto leading-relaxed">
          Something went wrong on our end. We're already looking into it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="neo-btn-primary px-8 py-4 rounded-2xl font-extrabold text-sm tracking-wide shadow-lg"
          >
            Try Again
          </button>
          <Link 
            href="/" 
            className="px-8 py-4 rounded-2xl font-extrabold text-sm text-[#718096] hover:text-[#1a202c] transition-all"
          >
            Return Home
          </Link>
        </div>
        
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-red-50 rounded-xl text-left overflow-auto text-xs text-red-800 font-mono">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
