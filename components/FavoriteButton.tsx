"use client";

import { useState } from "react";
import { toggleFavorite } from "@/app/actions/favorite";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  listingId: string;
  initialIsFavorited?: boolean;
  className?: string;
}

export default function FavoriteButton({ 
  listingId, 
  initialIsFavorited = false,
  className = "" 
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    // Optimistic update
    const nextState = !isFavorited;
    setIsFavorited(nextState);

    const result = await toggleFavorite(listingId);
    setIsLoading(false);

    if (result.error) {
      // Revert on error
      setIsFavorited(!nextState);
      // Optional: Show toast error
    } else {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`group/heart flex items-center justify-center rounded-full transition-all active:scale-90 ${className}`}
      aria-label={isFavorited ? "Remove from saved" : "Save to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-6 h-6 transition-colors ${
          isFavorited 
            ? "text-[#d32f2f] group-hover/heart:scale-110" 
            : "text-white drop-shadow-md group-hover/heart:text-[#d32f2f] group-hover/heart:scale-110"
        }`}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
