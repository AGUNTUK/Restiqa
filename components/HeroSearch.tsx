"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { dictionaries } from "@/lib/i18n/dictionaries";
import LocationAutocomplete from "./LocationAutocomplete";
import GuestSelector from "./GuestSelector";
import { GUEST_OPTIONS } from "@/lib/constants";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";

type Guests = { adults: number; children: number; infants: number };

const CATEGORIES = [
  { key: "apartment", label: "Apartments", icon: "🏠" },
  { key: "hotel",     label: "Hotels",     icon: "🏨" },
  { key: "resort",   label: "Tours",      icon: "🗺️" },
] as const;

type Category = typeof CATEGORIES[number]["key"];

export default function HeroSearch({ dict }: { dict: typeof dictionaries["en"] }) {
  const router = useRouter();
  const { addSearch } = useRecentSearches();

  const [activeCategory, setActiveCategory] = useState<Category>("apartment");
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState<Guests>({ adults: 1, children: 0, infants: 0 });

  // Advanced Filters
  const [ac, setAc] = useState(false);
  const [nonAc, setNonAc] = useState(false);
  const [nearSea, setNearSea] = useState(false);
  const [hillView, setHillView] = useState(false);
  const [cityCenter, setCityCenter] = useState(false);
  const [coupleFriendly, setCoupleFriendly] = useState(false);
  const [familyFriendly, setFamilyFriendly] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = mounted ? new Date().toISOString().split("T")[0] : "";

  const totalGuests = guests.adults + guests.children;

  function changeGuest(key: keyof Guests, delta: number) {
    const min = GUEST_OPTIONS.find(o => o.key === key)?.min ?? 0;
    setGuests((g) => ({
      ...g,
      [key]: Math.max(min, g[key] + delta),
    }));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("city", location);
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    if (totalGuests > 0) params.set("guests", String(totalGuests));
    
    // Tag Filters Array
    const filters = [];
    if (ac) filters.push("AC");
    if (nonAc) filters.push("Non-AC");
    if (nearSea) filters.push("Near Sea");
    if (hillView) filters.push("Hill View");
    if (cityCenter) filters.push("City Center");
    if (coupleFriendly) filters.push("Couple-friendly");
    if (familyFriendly) filters.push("Family-friendly");
    
    if (filters.length > 0) {
      params.set("amenities", filters.join(","));
    }

    // Pass the category as type filter
    if (activeCategory) {
      params.set("type", activeCategory);
    }

    // Save to Recent Searches
    addSearch({
      location,
      checkin: checkIn,
      checkout: checkOut,
      guests
    });

    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ── Category Tabs ── */}
      <div className="flex gap-1 mb-3 p-1 bg-white/60 backdrop-blur-md rounded-2xl shadow-[4px_4px_10px_rgba(0,0,0,0.06),-4px_-4px_10px_#ffffff] w-full">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300"
            style={{
              background: activeCategory === cat.key ? "#d32f2f" : "transparent",
              color: activeCategory === cat.key ? "white" : "#718096",
              boxShadow: activeCategory === cat.key ? "0 4px 12px rgba(211,47,47,0.35)" : "none",
              transform: activeCategory === cat.key ? "translateY(-1px)" : "none",
            }}
          >
            <span className="text-base sm:text-lg">{cat.icon}</span>
            <span className="whitespace-nowrap">{cat.label}</span>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSearch}
        className="neo-card w-full rounded-[20px] p-3"
      >
      {/* Desktop: single row | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Location */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 pl-1" style={{ color: "#a0aec0" }}>
            {dict.search.location}
          </label>
          <div className="relative">
            <LocationAutocomplete
              placeholder={dict.search.where}
              defaultValue={location}
              onSelect={(item) => {
                if ('name' in item) {
                  setLocation(item.name);
                } else {
                  setLocation(item.location);
                  setCheckIn(item.checkin);
                  setCheckOut(item.checkout);
                  setGuests(item.guests);
                }
              }}
            />
          </div>
        </div>

        {/* Divider (desktop only) */}
        <div className="hidden lg:block w-px self-stretch" style={{ background: "#d1d9e0" }} />

        {/* Check-in */}
        <div className="flex-1 min-w-0">
          <label htmlFor="hero-checkin" className="block text-[10px] font-bold uppercase tracking-widest mb-1 pl-1" style={{ color: "#a0aec0" }}>
            {dict.search.checkIn}
          </label>
          <div className="neo-inset flex items-center gap-2 px-3 rounded-xl">
            <span className="text-base">📅</span>
            <input
              id="hero-checkin"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent border-none outline-none py-4 text-sm flex-1"
              style={{ color: checkIn ? "#2a6b78" : "#a0aec0", fontFamily: "inherit", minWidth: 0 }}
              min={today}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px self-stretch" style={{ background: "#d1d9e0" }} />

        {/* Check-out */}
        <div className="flex-1 min-w-0">
          <label htmlFor="hero-checkout" className="block text-[10px] font-bold uppercase tracking-widest mb-1 pl-1" style={{ color: "#a0aec0" }}>
            {dict.search.checkOut}
          </label>
          <div className="neo-inset flex items-center gap-2 px-3 rounded-xl">
            <span className="text-base">📅</span>
            <input
              id="hero-checkout"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent border-none outline-none py-4 text-sm flex-1"
              style={{ color: checkOut ? "#2a6b78" : "#a0aec0", fontFamily: "inherit", minWidth: 0 }}
              min={checkIn || today}
            />
          </div>
        </div>

        {/* Guests via Portal */}
        <GuestSelector 
          guests={guests} 
          onGuestsChange={changeGuest} 
          dict={dict} 
        />

        {/* Search button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="neo-btn neo-btn-primary rounded-xl font-extrabold text-sm px-8 py-4 w-full lg:w-auto whitespace-nowrap active:scale-95 transition-all"
            id="hero-search-btn"
          >
            🔍 Search {CATEGORIES.find(c => c.key === activeCategory)?.label}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-4 pt-3 mt-3 border-t border-[#d1d9e0]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">{dict.filters.title}:</span>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {/* AC / Non-AC */}
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={ac} onChange={(e) => setAc(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.ac}
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={nonAc} onChange={(e) => setNonAc(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.nonAc}
          </label>

          {/* Location Types */}
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={nearSea} onChange={(e) => setNearSea(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.nearSea}
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={hillView} onChange={(e) => setHillView(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.hillView}
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={cityCenter} onChange={(e) => setCityCenter(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.cityCenter}
          </label>

          {/* Property Types / Vibes */}
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={familyFriendly} onChange={(e) => setFamilyFriendly(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.familyFriendly}
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={coupleFriendly} onChange={(e) => setCoupleFriendly(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.coupleFriendly}
          </label>
        </div>
      </div>

    </form>
    </div>
  );
}
