"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { markNotificationsRead } from "@/app/actions/notifications";

export type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell({ 
  initialNotifications,
  userId
}: { 
  initialNotifications: NotificationType[];
  userId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Sync state with initial notifications if they change externally (e.g. on navigation)
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Subscribe to real-time notification inserts for this specific user
    const channel = supabase
      .channel(`realtime:notifications:user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as NotificationType;
          setNotifications((prev) => [newNotif, ...prev]);
          
          // Optional: Add sound or desktop notification trigger here
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Optimistic visual update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      // Fire action to push DB state
      await markNotificationsRead(notifications.filter(n => !n.is_read).map(n => n.id));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="relative neo-card p-2 md:p-3 rounded-xl hover:shadow-inner hover:bg-white/40 transition-all flex items-center justify-center group outline-none"
        aria-label="View Notifications"
      >
        <span className="text-xl md:text-2xl group-hover:scale-110 transition-transform">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 border-2 border-[#f0f4f8] text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[320px] md:w-[400px] rounded-[28px] bg-[#f0f4f8] neo-inset shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 origin-top-right">
          <div className="p-5 border-b border-white/50 bg-[#e0e5ec] flex justify-between items-center">
            <h3 className="font-extrabold text-[#1a202c] text-lg">Notifications</h3>
            {unreadCount > 0 && <span className="text-[10px] font-black uppercase text-[#8a84ff] tracking-widest bg-white rounded-full px-2 py-1 shadow-sm">{unreadCount} New</span>}
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto w-full custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-[#718096] text-sm font-bold flex flex-col items-center gap-2">
                <span className="text-4xl filter grayscale opacity-50 mb-2">📬</span>
                Inbox zero! You're all caught up.
              </div>
            ) : (
              <div className="flex flex-col gap-[1px]">
                {notifications.map((n, i) => (
                  <div key={n.id} className={`p-5 transition-colors ${!n.is_read ? 'bg-white' : 'hover:bg-white/50'}`}>
                    <div className="flex gap-4">
                       <span className="text-2xl mt-0.5 shrink-0 drop-shadow-sm">
                         {n.type === 'success' ? '✅' : n.type === 'error' ? '🚫' : 'ℹ️'}
                       </span>
                       <div className="flex-1">
                          <h4 className="font-extrabold text-[#1a202c] text-sm leading-tight">{n.title}</h4>
                          <p className="text-[#4a5568] text-xs mt-1.5 leading-relaxed font-medium">{n.message}</p>
                          <span className="text-[9px] font-black text-[#a0aec0] mt-3 block uppercase tracking-widest opacity-80">
                            {new Date(n.created_at).toLocaleString(undefined, {
                               month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                            })}
                          </span>
                          
                          {n.link && (
                            <Link href={n.link} onClick={() => setIsOpen(false)} className="inline-block mt-3 text-[11px] font-black text-white bg-gradient-to-r from-[#d32f2f] to-[#8bc1c1] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all px-4 py-1.5 rounded-xl">
                              View Intel →
                            </Link>
                          )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
