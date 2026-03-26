import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AdminSearch from "@/components/AdminSearch";
import AdminPagination from "@/components/AdminPagination";

export const metadata: Metadata = {
  title: "Admin - Bookings",
  description: "Global Reservations Console",
};

const ITEMS_PER_PAGE = 15;

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.q || "";
  const page = Number(resolvedParams?.page) || 1;

  const supabase = await createClient();
  
  let query = supabase
    .from("bookings")
    .select("*, user_details:users!bookings_user_id_fkey(name), listings(title, host_details:users!listings_host_id_fkey(name))", { count: "exact" })
    .order("created_at", { ascending: false });

  // If NOT searching, perform database-level pagination.
  // If searching, we skip DB pagination, filter in JS, and then paginate in JS to support UUID string fragments
  let totalCount = 0;
  
  if (!searchQuery) {
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);
  }

  const { data: rawBookings, count } = await query;
  let bookings = rawBookings;
  totalCount = count || 0;
  
  if (bookings && searchQuery) {
    const q = searchQuery.toLowerCase();
    bookings = bookings.filter(b => 
      b.id.toLowerCase().includes(q) || 
      b.status.toLowerCase().includes(q)
    );
    totalCount = bookings.length;
    // JS Pagination for Search
    const from = (page - 1) * ITEMS_PER_PAGE;
    bookings = bookings.slice(from, from + ITEMS_PER_PAGE);
  }

  if (!bookings) return <div className="p-8">No bookings found.</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Bookings</h1>
          <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Global Reservations Ledger</p>
        </div>
        <AdminSearch placeholder="Search by booking ID or status..." />
      </div>

      <div className="neo-card rounded-[24px] overflow-hidden mx-6 md:mx-0">
        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col divide-y divide-white/40">
          {bookings.map((booking) => {
            const checkin = new Date(booking.checkin).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const checkout = new Date(booking.checkout).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return (
              <div key={booking.id} className="p-4 flex flex-col gap-3 hover:bg-white/20 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-extrabold text-[#1a202c] mb-0.5">{booking.id.split("-")[0]}</p>
                    <p className="text-[11px] font-bold text-[#718096]">{checkin} - {checkout}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase shadow-sm ${booking.status === 'confirmed' ? 'bg-[#43e97b]/20 text-[#28a745]' : booking.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {booking.status}
                  </span>
                </div>
                
                <Link href={`/listing/${booking.listing_id}`} className="block neo-inset p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors">
                  <p className="text-xs font-extrabold text-[#1a202c] line-clamp-1 mb-1">{(booking.listings as any)?.title || "Unknown Property"}</p>
                  <p className="text-[10px] font-bold text-[#4a5568]">Host: {((booking.listings as any)?.host_details as any)?.name || "Unknown"}</p>
                </Link>

                <div className="flex justify-between items-end mt-1">
                  <div>
                    <span className="text-[10px] text-[#a0aec0] uppercase tracking-wider block mb-0.5">Guest</span>
                    <p className="text-xs font-bold text-[#4a5568]">{(booking.user_details as any)?.name || "Unknown"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[#d32f2f]">৳{Math.round(booking.total_amount || booking.total_price)}</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shadow-sm ${booking.payment_status === 'paid' ? 'bg-[#43e97b]/20 text-[#28a745]' : booking.payment_status === 'refunded' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                      {booking.payment_status || "pending"} Pay
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">ID / Date</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Guest & Host</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Property</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Financials</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const checkin = new Date(booking.checkin).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const checkout = new Date(booking.checkout).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <tr key={booking.id} className="border-b border-white/40 hover:bg-white/20 transition-colors">
                    <td className="p-5">
                      <p className="text-sm font-extrabold text-[#1a202c] mb-1">{booking.id.split("-")[0]}</p>
                      <p className="text-xs font-bold text-[#718096]">{checkin} - {checkout}</p>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-[#4a5568] mb-1"><span className="text-[10px] text-[#a0aec0] uppercase tracking-wider block">Guest:</span> {(booking.user_details as any)?.name || "Unknown"}</p>
                      <p className="text-sm font-bold text-[#4a5568]"><span className="text-[10px] text-[#a0aec0] uppercase tracking-wider block">Host:</span> {((booking.listings as any)?.host_details as any)?.name || "Unknown"}</p>
                    </td>
                    <td className="p-5">
                      <Link href={`/listing/${booking.listing_id}`} className="hover:underline">
                        <p className="text-sm font-extrabold text-[#1a202c] line-clamp-1">{(booking.listings as any)?.title}</p>
                      </Link>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-extrabold text-[#d32f2f] mb-1">৳{Math.round(booking.total_amount || booking.total_price)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${booking.payment_status === 'paid' ? 'bg-[#43e97b]/20 text-[#28a745]' : booking.payment_status === 'refunded' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {booking.payment_status || "pending"} Pay
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${booking.status === 'confirmed' ? 'bg-[#43e97b]/20 text-[#28a745]' : booking.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <AdminPagination totalItems={totalCount} itemsPerPage={ITEMS_PER_PAGE} />
    </div>
  );
}
