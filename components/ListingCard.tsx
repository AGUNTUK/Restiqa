import Link from "next/link";
import Image from "next/image";
import { type ListingWithStats } from "@/lib/types/database";
import { type dictionaries } from "@/lib/i18n/dictionaries";

interface ListingCardProps {
  listing: ListingWithStats;
  dict: typeof dictionaries["en"];
}

export default function ListingCard({ listing, dict }: ListingCardProps) {
  const isValidImage = (src: string) => {
    return src && (src.startsWith("/") || src.startsWith("http") || src.startsWith("https"));
  };

  const imageSrc = isValidImage(listing.images[0]) 
    ? listing.images[0] 
    : "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800";

  return (
    <Link href={`/listing/${listing.slug || listing.id}`} className="block group no-underline animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div className="neo-card rounded-[24px] sm:rounded-[32px] p-3 sm:p-4 transition-all duration-500 hover:-translate-y-3 hover:shadow-[12px_12px_24px_#c4c9ce,-12px_-12px_24px_#ffffff] border border-white/50 hover:bg-[#d32f2f]">
        {/* Thumbnail */}
        <div 
          className="relative rounded-[16px] overflow-hidden mb-4 bg-[#dde4ec]"
          style={{ aspectRatio: "4/3" }}
        >
          <Image
            src={imageSrc}
            alt={`${listing.title} in ${listing.city}, Bangladesh`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={listing.id === "bd-1"}
          />
          {/* Badges */}
          <div className="absolute top-3 inset-x-3 flex justify-between items-start pointer-events-none">
            <div className="neo-badge bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 border border-white/50" style={{ color: "#d32f2f" }}>
              <span className="text-xs">🛡️</span> {dict.listing.verified || "Verified"}
            </div>
            <div className="neo-badge bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
              <span style={{ color: "#f6ad55" }}>★</span>{" "}
              <span style={{ color: "#2a6b78" }}>{Number(listing.avg_rating).toFixed(1)}</span>
              <span style={{ color: "#a0aec0", fontWeight: 'normal' }}>({listing.review_count})</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-1">
            <h3
              className="font-bold text-base sm:text-lg truncate transition-colors group-hover:text-white"
              style={{ color: "#1a202c", letterSpacing: "-0.01em" }}
            >
              {listing.title}
            </h3>
            <p className="text-xs sm:text-sm font-medium truncate mb-3 transition-colors group-hover:text-white/80" style={{ color: "#718096" }}>
              {listing.city}, {listing.country}
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs font-semibold mb-4 transition-colors group-hover:text-white/70" style={{ color: "#a0aec0" }}>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            🛏️ {listing.beds} {listing.beds === 1 ? dict.listing.bed : dict.listing.beds}
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            🛁 {listing.baths} {listing.baths === 1 ? dict.listing.bath : dict.listing.baths}
          </span>
          <span className="flex items-center gap-1.5 capitalize whitespace-nowrap">
            🏠 {listing.type}
          </span>
        </div>

        {/* Footer (Price & CTA) */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#e2e8f0] group-hover:border-white/20">
          <div>
            <span className="font-extrabold text-lg sm:text-xl transition-colors group-hover:text-white" style={{ color: "#1a202c" }}>
              {dict.common.currency}{Math.round(listing.price)}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold transition-colors group-hover:text-white/60" style={{ color: "#a0aec0" }}>
              {" "}
              {dict.common.pricePerNight}
            </span>
          </div>
          <div
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#e8edf2] transition-all group-hover:bg-white group-hover:text-[#d32f2f]"
            style={{ color: "#d32f2f" }}
          >
            {dict.listing.view}
          </div>
        </div>
      </div>
    </Link>
  );
}

