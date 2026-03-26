import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { updateListingStatus } from "@/app/actions/admin";
import Link from "next/link";
import AdminSearch from "@/components/AdminSearch";
import AdminPagination from "@/components/AdminPagination";

export const metadata: Metadata = {
  title: "Admin - Listings",
  description: "Listings Moderation Console",
};

const ITEMS_PER_PAGE = 15;

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const resolvedParams = await searchParams;
  const filterStatus = resolvedParams?.status;
  const searchQuery = resolvedParams?.q || "";
  const page = Number(resolvedParams?.page) || 1;
  
  const supabase = await createClient();
  
  // Default to 'pending' if no status is provided, to act as a moderation queue
  const activeStatus = filterStatus || 'pending';
  
  let query = supabase.from("listings").select("*, users(name)", { count: "exact" }).order("created_at", { ascending: false });
  
  if (activeStatus !== 'all') {
    query = query.eq("status", activeStatus);
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
  }

  // Pagination bounds
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data: listings, count } = await query;

  if (!listings) return <div className="p-8">No listings found.</div>;

  const tabs = [
    { name: "Moderation Queue", value: "pending", icon: "🕒" },
    { name: "Approved", value: "approved", icon: "✅" },
    { name: "Rejected", value: "rejected", icon: "❌" },
    { name: "All Properties", value: "all", icon: "🏠" },
  ];

  const getTimeInQueue = (date: string) => {
    const created = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-10 p-6 md:p-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Listing Moderation</h1>
            <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Process approvals and rejections</p>
          </div>
          <AdminSearch placeholder="Search listings by title or city..." />
        </div>
        
        <div className="flex flex-wrap gap-4">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/listings?status=${tab.value}${searchQuery ? `&q=${searchQuery}` : ""}`}
              className={`px-6 py-3 rounded-[20px] text-xs font-bold transition-all flex items-center gap-2 ${
                activeStatus === tab.value
                  ? "bg-[#d32f2f] text-white shadow-lg neo-shadow-sm scale-105"
                  : "bg-white/50 text-[#718096] hover:bg-white/80"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="neo-card rounded-[32px] overflow-hidden border border-white/40">
        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col divide-y divide-white/40">
          {listings.length === 0 ? (
            <div className="p-8 text-center text-[#a0aec0] font-medium italic">
              No properties found in this category.
            </div>
          ) : (
            listings.map((listing) => (
              <div key={listing.id} className="p-5 flex flex-col gap-4 hover:bg-white/30 transition-colors">
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative shadow-sm border border-white">
                    <img 
                      src={listing.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-[#1a202c] mb-1 line-clamp-2 leading-tight">{listing.title}</p>
                    <p className="text-xs font-bold text-[#a0aec0] truncate">{listing.city}, {listing.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-1 bg-white/20 p-3 rounded-xl border border-white/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-[#a0aec0]">Host</span>
                    <span className="text-xs font-bold text-[#4a5568] truncate">{(listing.users as any)?.name || "Unknown"}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] uppercase font-bold text-[#a0aec0]">Price</span>
                    <span className="text-xs font-extrabold text-[#d32f2f]">৳{Math.round(listing.price)} <span className="text-[9px] font-bold text-[#a0aec0] uppercase">/ night</span></span>
                  </div>
                  {activeStatus === 'pending' && (
                    <div className="flex flex-col gap-1 col-span-2">
                       <span className="text-[10px] uppercase font-bold text-[#a0aec0]">Submitted</span>
                       <span className="text-xs font-bold text-[#718096]">{getTimeInQueue(listing.created_at)}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-[10px] uppercase font-bold text-[#a0aec0]">Status</span>
                    <span className={`self-start px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase shadow-sm ${
                      listing.status === 'approved' 
                        ? 'bg-[#43e97b]/10 text-[#28a745] border border-[#43e97b]/20' 
                        : listing.status === 'pending' 
                          ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                          : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {listing.status || "approved"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-2 pt-3 border-t border-white/30">
                  <form action={updateListingStatus} className="flex-1">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <input type="hidden" name="status" value={listing.status === 'approved' ? 'pending' : 'approved'} />
                    <button 
                      type="submit" 
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                        listing.status === 'approved'
                          ? "text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200/50"
                          : "text-[#28a745] bg-[#43e97b]/10 hover:bg-[#43e97b]/20 border border-[#43e97b]/30"
                      }`}
                    >
                      {listing.status === 'approved' ? 'Re-review' : 'Approve'}
                    </button>
                  </form>
                  {listing.status !== 'rejected' && (
                    <form action={updateListingStatus} className="flex-1">
                      <input type="hidden" name="listingId" value={listing.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-extrabold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/50 shadow-sm">
                        Reject
                      </button>
                    </form>
                  )}
                  <Link href={`/listing/${listing.slug}`} target="_blank" className="flex items-center justify-center px-4 bg-white/60 rounded-xl hover:bg-white/80 transition-colors shadow-sm text-sm border border-white">
                    👁️
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Property Details</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Host</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Pricing</th>
                {activeStatus === 'pending' && <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Submitted</th>}
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Status</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Moderation</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#a0aec0] font-medium italic">
                    No properties found in this category.
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-white/40 hover:bg-white/30 transition-colors">
                    <td className="p-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative shadow-sm border border-white">
                          <img 
                            src={listing.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6"}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-[#1a202c] mb-0.5 line-clamp-1">{listing.title}</p>
                          <p className="text-xs font-bold text-[#a0aec0]">{listing.city}, {listing.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-bold text-[#4a5568]">
                      {(listing.users as any)?.name || "Unknown"}
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-extrabold text-[#d32f2f]">৳{Math.round(listing.price)}</p>
                      <p className="text-[10px] uppercase font-bold text-[#a0aec0]">per night</p>
                    </td>
                    {activeStatus === 'pending' && (
                      <td className="p-6 text-sm font-bold text-[#718096]">
                        {getTimeInQueue(listing.created_at)}
                      </td>
                    )}
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                        listing.status === 'approved' 
                          ? 'bg-[#43e97b]/10 text-[#28a745] border border-[#43e97b]/20' 
                          : listing.status === 'pending' 
                            ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                            : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {listing.status || "approved"}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-3 justify-end items-center">
                        <form action={updateListingStatus}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="status" value={listing.status === 'approved' ? 'pending' : 'approved'} />
                          <button 
                            type="submit" 
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                              listing.status === 'approved'
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-[#28a745] hover:bg-[#43e97b]/10 border border-transparent hover:border-[#43e97b]/20"
                            }`}
                          >
                            {listing.status === 'approved' ? 'Re-review' : 'Approve'}
                          </button>
                        </form>
                        {listing.status !== 'rejected' && (
                          <form action={updateListingStatus}>
                            <input type="hidden" name="listingId" value={listing.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-extrabold text-red-500 hover:bg-red-50 hover:shadow-sm">
                              Reject
                            </button>
                          </form>
                        )}
                        <Link href={`/listing/${listing.slug}`} target="_blank" className="p-2 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
                          👁️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination totalItems={count || 0} itemsPerPage={ITEMS_PER_PAGE} />
    </div>
  );
}
