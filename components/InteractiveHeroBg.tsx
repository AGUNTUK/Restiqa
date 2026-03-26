"use client";

import { useEffect, useRef } from "react";

// Top tier travel/real-estate photography from Unsplash
const ITEMS = [
  { 
    id: 1, 
    type: "glass", 
    icon: "🏠", 
    top: "20%", 
    left: "5%", 
    delay: "0s", 
    rotate: "-rotate-6",
    size: "w-24 h-24 text-4xl",
    speed: 0.8
  },
  { 
    id: 2, 
    type: "glass", 
    icon: "🌴", 
    top: "15%", 
    left: "15%", 
    delay: "2s", 
    rotate: "rotate-12",
    size: "w-20 h-20 text-3xl",
    speed: 1.5
  },
  { 
    id: 3, 
    type: "glass", 
    icon: "🏖️", 
    top: "65%", 
    left: "8%", 
    delay: "1s", 
    rotate: "rotate-6",
    size: "w-16 h-16 text-2xl",
    speed: 1.2
  },
  { 
    id: 4, 
    type: "glass", 
    icon: "📷", 
    top: "80%", 
    left: "20%", 
    delay: "3s", 
    rotate: "-rotate-12",
    size: "w-20 h-20 text-3xl",
    speed: 1.8
  },
  { 
    id: 6, 
    type: "glass", 
    icon: "✈️", 
    top: "12%", 
    left: "80%", 
    delay: "4s", 
    rotate: "rotate-45",
    size: "w-16 h-16 text-2xl",
    speed: 2
  },
  { 
    id: 7, 
    type: "glass", 
    icon: "🧳", 
    top: "25%", 
    left: "85%", 
    delay: "1.5s", 
    rotate: "-rotate-6",
    size: "w-24 h-24 text-4xl",
    speed: 0.9
  },
  { 
    id: 8, 
    type: "glass", 
    icon: "🗺️", 
    top: "75%", 
    left: "75%", 
    delay: "5s", 
    rotate: "rotate-3",
    size: "w-20 h-20 text-3xl",
    speed: 1.4
  },
  { 
    id: 9, 
    type: "glass", 
    icon: "🛳️", 
    top: "60%", 
    left: "90%", 
    delay: "2.5s", 
    rotate: "rotate-12",
    size: "w-16 h-16 text-2xl",
    speed: 1.2
  },
];

export default function InteractiveHeroBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Spatial parallax math linked to mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      
      // Calculate delta from center of screen (-1 to 1)
      const xOrigin = (clientX / window.innerWidth - 0.5) * 2;
      const yOrigin = (clientY / window.innerHeight - 0.5) * 2;

      // Select all DOM nodes marked for parallax tracking
      const elements = containerRef.current.querySelectorAll(".parallax-node");
      
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const speed = parseFloat(htmlEl.dataset.speed || "1");
        
        // Push the element natively via hardware-accelerated transforms
        const xOffset = xOrigin * 30 * speed;
        const yOffset = yOrigin * 30 * speed;
        
        htmlEl.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
    >
      {/* ── Soft Ambient Nebulas ── */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] rounded-full opacity-15 mix-blend-multiply blur-[120px] animate-pulse-slow"
        style={{ background: "#d32f2f" }}
      />
      <div
        className="absolute top-[10%] -right-[15%] w-[55%] h-[85%] rounded-full opacity-10 mix-blend-multiply blur-[120px] animate-pulse-slow"
        style={{ background: "#8bc1c1", animationDelay: "2s" }}
      />
      <div
        className="absolute -bottom-[20%] left-[20%] w-[40%] h-[60%] rounded-full opacity-10 mix-blend-multiply blur-[100px] animate-pulse-slow"
        style={{ background: "#43e97b", animationDelay: "1s" }}
      />

      {/* ── Interactive Spatial Nodes ── */}
      {ITEMS.map((item) => (
        <div
          key={item.id}
          className="absolute flex items-center justify-center pointer-events-none"
          style={{ top: item.top, left: item.left }}
        >
          {/* Parallax Container (tracks mouse, ease-out transition prevents jitter) */}
            <div 
              className="parallax-node transition-transform duration-500 ease-out will-change-transform"
              data-speed={item.speed}
            >
              {/* CSS Animation Wrapper (constant slow bobbing) */}
              <div 
                style={{ 
                  animation: "float 6s ease-in-out infinite", 
                  animationDelay: item.delay 
                }}
              >
                <div 
                  className={`neo-card flex items-center justify-center bg-white/40 backdrop-blur-2xl shadow-[10px_10px_30px_rgba(0,0,0,0.05)] border border-white/80 ${item.size} ${item.rotate} rounded-[32px] ${item.id > 4 ? 'hidden sm:flex' : 'flex'} animate-in zoom-in-50 duration-1000`}
                >
                  {item.icon}
                </div>
            </div>
          </div>
        </div>
      ))}

      {/* Inject Global Float Data just once */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}} />
    </div>
  );
}
