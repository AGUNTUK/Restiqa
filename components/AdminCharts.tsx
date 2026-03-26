"use client";

import { useEffect, useState } from "react";

type ChartData = {
  date: string;
  label: string;
  value: number;
};

export function RevenueBarChart({ data }: { data: ChartData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid div by 0

  return (
    <div className="neo-card p-6 rounded-[24px] h-64 flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-[#1a202c] font-extrabold text-lg">7-Day Revenue</h3>
          <p className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest">Platform Commissions</p>
        </div>
        <div className="text-2xl drop-shadow-sm">💰</div>
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-3 overflow-hidden px-1">
        {data.map((item, i) => {
          const heightPct = mounted ? Math.max((item.value / maxValue) * 100, 5) : 5; // minimum 5% height for visibility
          return (
            <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
              <div className="w-full flex justify-center relative h-[calc(100%-1.5rem)] items-end">
                {/* Tooltip */}
                <div className="absolute -top-8 bg-[#1a202c] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl scale-95 group-hover:scale-100 duration-200">
                  ৳{Math.round(item.value)}
                </div>
                {/* Bar */}
                <div 
                  className="w-full max-w-[2.5rem] bg-gradient-to-t from-[#f6d365] to-[#fda085] rounded-t-xl transition-all duration-1000 ease-out shadow-sm" 
                  style={{ height: `${heightPct}%`, minHeight: '6px' }}
                />
                
                {/* Hover overlay for hit area */}
                <div className="absolute inset-x-0 bottom-0 h-full w-full bg-transparent z-0 group-hover:bg-white/10 rounded-t-xl transition-colors cursor-crosshair"></div>
              </div>
              <span className="text-[9px] font-extrabold text-[#718096] mt-2 uppercase tracking-wide">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function UsersSparkline({ data }: { data: ChartData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="neo-card p-6 rounded-[24px] h-64 flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-[#1a202c] font-extrabold text-lg">New Users</h3>
          <p className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest">Last 7 Days Growth</p>
        </div>
        <div className="text-2xl drop-shadow-sm">👥</div>
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-1 overflow-visible relative px-2">
        <svg viewBox="0 0 100 100" fill="none" className="absolute inset-0 w-full h-[calc(100%-1.5rem)] overflow-visible" preserveAspectRatio="none">
           {mounted && (
             <polyline
               points={data.map((item, i) => {
                 const x = (i / (data.length - 1)) * 100;
                 const y = Math.max(100 - (item.value / Math.max(maxValue, 1)) * 100, 5); // Pad top and bottom
                 return `${x},${y}`;
               }).join(" ")}
               stroke="url(#gradient)"
               strokeWidth="4"
               strokeLinecap="round"
               strokeLinejoin="round"
               className="drop-shadow-md"
               vectorEffect="non-scaling-stroke"
             />
           )}
           <defs>
             <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#d32f2f" />
               <stop offset="100%" stopColor="#8a84ff" />
             </linearGradient>
           </defs>
        </svg>

        {/* Labels & Hit Areas positioned at bottom */}
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center flex-1 justify-end z-10 pb-1 h-full group cursor-crosshair relative">
             <div className="absolute top-0 md:-top-4 bg-[#1a202c] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-xl scale-95 group-hover:scale-100 duration-200 pointer-events-none whitespace-nowrap">
               {item.value} users
             </div>
             <div className="h-[calc(100%+1.5rem)] w-full absolute inset-0 group-hover:bg-white/30 transition-colors rounded-lg border border-transparent group-hover:border-white/50 backdrop-blur-[1px]"></div>
             <span className="text-[9px] font-extrabold text-[#718096] uppercase translate-y-6 tracking-wide">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
