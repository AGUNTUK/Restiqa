import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { toggleUserStatus } from "@/app/actions/admin";
import Link from "next/link";
import AdminSearch from "@/components/AdminSearch";
import AdminPagination from "@/components/AdminPagination";

export const metadata: Metadata = {
  title: "Admin - Users",
  description: "User Management Console",
};

const ITEMS_PER_PAGE = 15;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ role?: string; q?: string; page?: string }> }) {
  const resolvedParams = await searchParams;
  const filterRole = resolvedParams?.role || "all";
  const searchQuery = resolvedParams?.q || "";
  const page = Number(resolvedParams?.page) || 1;

  const supabase = await createClient();
  let query = supabase.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (filterRole !== "all") {
    query = query.eq("role", filterRole);
  }
  
  if (searchQuery) {
    // Basic searching by name or email
    query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
  }

  // Pagination bounds
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data: users, count } = await query;

  if (!users) return <div className="p-8">No users found.</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Users</h1>
            <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Manage platform members</p>
          </div>
          <AdminSearch placeholder="Search users by name or email..." />
        </div>

        <div className="flex flex-wrap gap-2">
           <Link href={`?role=all${searchQuery ? `&q=${searchQuery}` : ""}`} className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-extrabold transition-all border border-transparent shadow-sm ${filterRole === "all" ? "bg-[#1a202c] text-white" : "bg-white text-[#718096] hover:border-gray-300"}`}>All</Link>
           <Link href={`?role=admin${searchQuery ? `&q=${searchQuery}` : ""}`} className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-extrabold transition-all border border-transparent shadow-sm ${filterRole === "admin" ? "bg-gradient-to-r from-[#8bc1c1] to-[#ff849b] text-white" : "bg-white text-[#718096] hover:border-gray-300"}`}>Admins</Link>
           <Link href={`?role=host${searchQuery ? `&q=${searchQuery}` : ""}`} className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-extrabold transition-all border border-transparent shadow-sm ${filterRole === "host" ? "bg-[#d32f2f] text-white" : "bg-white text-[#718096] hover:border-gray-300"}`}>Hosts</Link>
           <Link href={`?role=user${searchQuery ? `&q=${searchQuery}` : ""}`} className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-extrabold transition-all border border-transparent shadow-sm ${filterRole === "user" ? "bg-gray-500 text-white" : "bg-white text-[#718096] hover:border-gray-300"}`}>Travelers</Link>
        </div>
      </div>

      <div className="neo-card rounded-[24px] overflow-hidden mx-6 md:mx-0">
        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col divide-y divide-white/40">
          {users.map((user) => (
            <div key={user.id} className="p-4 flex flex-col gap-4 hover:bg-white/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-extrabold text-[#4a5568] shrink-0 overflow-hidden shadow-sm">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        user.name?.charAt(0) || "U"
                    )}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-[#1a202c]">{user.name || "Unknown"}</p>
                    <p className="text-[10px] font-bold text-[#a0aec0] mt-0.5 truncate max-w-[120px]">{user.id}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase shadow-sm ${user.role === 'admin' ? 'bg-gradient-to-r from-[#8bc1c1] to-[#ff849b] text-white' : user.role === 'host' ? 'bg-[#d32f2f]/10 text-[#d32f2f] border border-[#d32f2f]/20' : 'bg-gray-100 text-gray-500'}`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-[#a0aec0]">Joined</span>
                  <span className="text-xs font-bold text-[#4a5568]">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[10px] uppercase font-bold text-[#a0aec0]">Status</span>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase shadow-sm ${user.is_active ? 'bg-[#43e97b]/20 text-[#28a745]' : 'bg-red-100 text-red-600'}`}>
                    {user.is_active ? "Active" : "Suspended"}
                  </span>
                </div>
              </div>
              {user.role !== 'admin' && (
                <div className="mt-2 pt-3 border-t border-white/30">
                  <form action={toggleUserStatus} className="w-full">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="currentStatus" value={String(user.is_active)} />
                      <button type="submit" className={`w-full text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm ${user.is_active ? "text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200/50" : "text-[#28a745] bg-green-50 hover:bg-green-100 border border-green-200/50"}`}>
                        {user.is_active ? "Suspend User" : "Activate User"}
                      </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Member</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Role</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Joined</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Status</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/40 hover:bg-white/20 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-extrabold text-[#4a5568] shrink-0 overflow-hidden shadow-sm">
                        {user.avatar_url ? (
                           <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                           user.name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-[#1a202c]">{user.name || "Unknown"}</p>
                        <p className="text-xs font-bold text-[#a0aec0] mt-1 hidden sm:block">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${user.role === 'admin' ? 'bg-gradient-to-r from-[#8bc1c1] to-[#ff849b] text-white' : user.role === 'host' ? 'bg-[#d32f2f]/10 text-[#d32f2f] border border-[#d32f2f]/20' : 'bg-gray-100 text-gray-500'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-sm font-bold text-[#4a5568]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${user.is_active ? 'bg-[#43e97b]/20 text-[#28a745]' : 'bg-red-100 text-red-600'}`}>
                      {user.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {user.role !== 'admin' && (
                      <form action={toggleUserStatus}>
                         <input type="hidden" name="userId" value={user.id} />
                         <input type="hidden" name="currentStatus" value={String(user.is_active)} />
                         <button type="submit" className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${user.is_active ? "text-amber-600 hover:bg-amber-50" : "text-[#28a745] hover:bg-green-50"}`}>
                           {user.is_active ? "Suspend" : "Activate"}
                         </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      <AdminPagination totalItems={count || 0} itemsPerPage={ITEMS_PER_PAGE} />
    </div>
  );
}
