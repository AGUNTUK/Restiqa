"use client";

import { useEffect, useState } from "react";

interface MobileStickyBookProps {
  price: number;
  rating: number;
  reviewsCount: number;
  currency: string;
  pricePerNight: string;
  reserveBtn: string;
}

export default function MobileStickyBook({ 
  price, 
  rating, 
  reviewsCount, 
  currency, 
  pricePerNight,
  reserveBtn 
}: MobileStickyBookProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when user scrolls past the top 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBooking = () => {
    const widget = document.getElementById("booking-widget-container");
    if (widget) {
      widget.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[100] md:hidden transition-transform duration-500 transform ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-[#e0e5ec]/95 backdrop-blur-xl border-t border-white/40 px-6 py-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-black text-lg text-[#1a202c]">{currency}{Math.round(price)}</span>
            <span className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-tighter">{pricePerNight}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#2a6b78]">
             <span className="text-[#f6ad55]">★</span>
             <span>{rating.toFixed(1)}</span>
             <span className="text-[#a0aec0] font-medium">({reviewsCount})</span>
          </div>
        </div>

        <button 
          onClick={scrollToBooking}
          className="bg-gradient-to-r from-[#d32f2f] to-[#8bc1c1] text-white font-black px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          {reserveBtn}
        </button>
      </div>
    </div>
  );
}
