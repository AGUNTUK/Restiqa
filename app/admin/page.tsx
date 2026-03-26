import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { RevenueBarChart, UsersSparkline } from "@/components/AdminCharts";

export const metadata: Metadata = {
  title: "Admin - Overview",
  description: "Restiqa Admin Dashboard",
};

// Helper to group by day for the last 7 days
function getLast7DaysData(records: any[], valueKey?: string) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Sum or Count
    const dailyRecords = records?.filter(r => r.created_at.startsWith(dateStr)) || [];
    const value = valueKey 
      ? dailyRecords.reduce((sum, r) => sum + (r[valueKey] || 0), 0)
      : dailyRecords.length;
      
    days.push({
      date: dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      value
    });
  }
  return days;
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();
  
  // Fetch stats concurrently
  const [
    { count: usersCount },
    { count: listingsCount },
    { count: bookingsCount },
    { data: transactions },
    { count: pendingListingsCount },
    { data: readyPayouts },
    { data: recentTransactions },
    { data: recentUsers }
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("amount").eq("type", "commission").eq("status", "completed"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("id").eq("payout_status", "pending").lte("checkout", today),
    supabase.from("transactions").select("amount, created_at").eq("type", "commission").eq("status", "completed").gte("created_at", sevenDaysAgoISO),
    supabase.from("users").select("created_at").gte("created_at", sevenDaysAgoISO)
  ]);

  const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
  const readyPayoutCount = readyPayouts?.length || 0;

  const revenueData = getLast7DaysData(recentTransactions || [], "amount");
  const usersData = getLast7DaysData(recentUsers || []);

  const stats = [
    { label: "Total Users", value: usersCount || 0, icon: "👥", color: "from-[#d32f2f] to-[#8a84ff]" },
    { label: "Total Listings", value: listingsCount || 0, icon: "🏡", color: "from-[#43e97b] to-[#38f9d7]" },
    { label: "Total Bookings", value: bookingsCount || 0, icon: "📆", color: "from-[#fa709a] to-[#fee140]" },
    { label: "Total Revenue", value: `৳${totalRevenue.toLocaleString()}`, icon: "💰", color: "from-[#f6d365] to-[#fda085]" }
  ];

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="mb-8 p-6 md:p-0">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">System Overview</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Real-time performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="neo-card p-6 rounded-[24px] relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl`}></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl filter drop-shadow-sm">{stat.icon}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-1">{stat.label}</p>
            <p className="text-3xl font-extrabold text-[#1a202c]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Action Alerts Section */}
      {(pendingListingsCount! > 0 || readyPayoutCount > 0) && (
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingListingsCount! > 0 && (
            <Link href="/admin/listings?status=pending" className="neo-card p-6 rounded-[28px] border-l-4 border-orange-400 bg-orange-50/30 flex items-center justify-between group hover:scale-[1.02] transition-all">
              <div>
                <p className="text-orange-600 font-extrabold text-sm uppercase tracking-wider mb-1">Attention Required</p>
                <h3 className="text-xl font-bold text-[#1a202c]">{pendingListingsCount} Pending Listings</h3>
                <p className="text-sm text-[#718096]">Properties awaiting moderation</p>
              </div>
              <span className="text-3xl group-hover:translate-x-1 transition-transform">➡️</span>
            </Link>
          )}
          {readyPayoutCount > 0 && (
            <Link href="/admin/payouts" className="neo-card p-6 rounded-[28px] border-l-4 border-[#43e97b] bg-green-50/30 flex items-center justify-between group hover:scale-[1.02] transition-all">
              <div>
                <p className="text-[#28a745] font-extrabold text-sm uppercase tracking-wider mb-1">Ready for Action</p>
                <h3 className="text-xl font-bold text-[#1a202c]">{readyPayoutCount} Payouts Ready</h3>
                <p className="text-sm text-[#718096]">Funds eligible for host release</p>
              </div>
              <span className="text-3xl group-hover:translate-x-1 transition-transform">➡️</span>
            </Link>
          )}
        </div>
      )}
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
         <RevenueBarChart data={revenueData} />
         <UsersSparkline data={usersData} />
      </div>

      {/* Quick Action Hub */}
      <div className="mb-8 p-6 md:p-0">
         <h2 className="text-2xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Quick Actions</h2>
         <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase mb-6">Manage platform operations instantly</p>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Link href="/admin/payments" className="neo-card p-6 rounded-[24px] flex flex-col items-center justify-center text-center group hover:bg-white/40 transition-colors">
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">💳</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1a202c]">Verify Payments</span>
           </Link>
           <Link href="/admin/users" className="neo-card p-6 rounded-[24px] flex flex-col items-center justify-center text-center group hover:bg-white/40 transition-colors">
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🕵️‍♂️</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1a202c]">User Audit</span>
           </Link>
           <Link href="/admin/bookings" className="neo-card p-6 rounded-[24px] flex flex-col items-center justify-center text-center group hover:bg-white/40 transition-colors">
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📅</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1a202c]">Manage Bookings</span>
           </Link>
           <Link href="/" target="_blank" className="neo-card p-6 rounded-[24px] flex flex-col items-center justify-center text-center group hover:bg-white/40 transition-colors">
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🌐</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1a202c]">View Live Site</span>
           </Link>
         </div>
      </div>

    </div>
  );
}
