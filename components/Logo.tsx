"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = "", width = 150, height = 50 }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 text-decoration-none transition-opacity hover:opacity-90 ${className}`}
      style={{
        fontWeight: 800,
        fontSize: "1.4rem",
        letterSpacing: "-0.03em",
        color: "#d32f2f",
      }}
    >
      <div 
        className="relative flex items-center justify-center shrink-0" 
        style={{ width, height, position: 'relative' }}
      >
        {/* We use standard img with fallback, as the user needs to provide the actual logo file (e.g. logo.png or logo.webp) */}
        <img 
          src="/logo.png" 
          alt="Restiqa Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            // Fallback to stylized text if logo.png is missing
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'inline-flex';
          }}
        />
        <span 
          className="logo-fallback"
          style={{
            display: 'none',
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <span
            style={{
              width: height * 0.64,
              height: height * 0.64,
              borderRadius: 8,
              background: "linear-gradient(135deg,#d32f2f,#8bc1c1)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: `${height * 0.3}px`,
            }}
          >
            🏠
          </span>
          Restiqa
        </span>
      </div>
    </Link>
  );
}
