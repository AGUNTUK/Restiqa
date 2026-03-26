"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const links = [
    { name: "Overview", href: "/admin", icon: "📊" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "Listings", href: "/admin/listings", icon: "🏡" },
    { name: "Bookings", href: "/admin/bookings", icon: "📆" },
    { name: "Revenue", href: "/admin/revenue", icon: "📈" },
    { name: "Payouts", href: "/admin/payouts", icon: "💸" },
    { name: "Payments", href: "/admin/payments", icon: "💳" },
    { name: "Transactions", href: "/admin/transactions", icon: "🧾" },
    { name: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#f0f4f8] border-b border-white/50 shadow-sm sticky top-0 z-[30]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d32f2f] to-[#8bc1c1] flex items-center justify-center text-white font-extrabold shadow-[2px_2px_8px_rgba(211,47,47,0.4)]">
            A
          </div>
          <div>
            <h2 className="font-extrabold text-[#1a202c] text-lg leading-tight">Admin</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">Restiqa Ops</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-[#4a5568] hover:bg-gray-50 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Sidebar Content */}
      <aside className={`w-full md:w-64 neo-card shrink-0 p-6 flex-col gap-8 rounded-none md:min-h-screen border-r border-white/50 z-[20] sticky top-[73px] md:top-0 h-[calc(100vh-73px)] md:h-screen ${isOpen ? "flex fixed left-0 bg-[#f0f4f8] shadow-2xl overflow-y-auto w-[280px]" : "hidden md:flex"}`}>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d32f2f] to-[#8bc1c1] flex items-center justify-center text-white font-extrabold shadow-[2px_2px_8px_rgba(211,47,47,0.4)]">
            A
          </div>
          <div>
            <h2 className="font-extrabold text-[#1a202c] text-lg">Admin</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">Restiqa Ops</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {links.map(link => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin');
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold ${isActive ? "bg-white shadow-sm text-[#d32f2f] translate-x-1" : "text-[#4a5568] hover:bg-white/50 hover:translate-x-0.5"}`}
              >
                <span className="text-xl">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto mb-4 md:mb-0">
          <Link href="/dashboard" className="flex items-center justify-center w-full py-3 neo-inset rounded-xl text-xs font-bold text-[#a0aec0] bg-transparent hover:text-[#d32f2f] transition-colors">
            Exit Hub
          </Link>
        </div>
      </aside>
      
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-[15] md:hidden backdrop-blur-sm top-[73px]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
