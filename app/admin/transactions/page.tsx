import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminSearch from "@/components/AdminSearch";
import AdminPagination from "@/components/AdminPagination";

export const metadata: Metadata = {
  title: "Admin - Transactions",
  description: "Platform Financial Ledger",
};

const ITEMS_PER_PAGE = 15;

export default async function AdminTransactionsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.q || "";
  const page = Number(resolvedParams?.page) || 1;

  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select("*, users!transactions_user_id_fkey(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  let totalCount = 0;

  if (!searchQuery) {
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);
  }

  const { data: rawTransactions, count } = await query;
  let transactions = rawTransactions;
  totalCount = count || 0;

  if (transactions && searchQuery) {
    const q = searchQuery.toLowerCase();
    transactions = transactions.filter(tx => 
      tx.id.toLowerCase().includes(q) || 
      tx.booking_id?.toLowerCase().includes(q) ||
      (tx.users as any)?.name?.toLowerCase().includes(q)
    );
    totalCount = transactions.length;
    
    // JS Pagination for Search
    const from = (page - 1) * ITEMS_PER_PAGE;
    transactions = transactions.slice(from, from + ITEMS_PER_PAGE);
  }

  if (!transactions) return <div className="p-8">No transactions found.</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Transactions Ledger</h1>
          <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">All Platform Financial Movements</p>
        </div>
        <AdminSearch placeholder="Search by ID, User or Booking..." />
      </div>

      <div className="neo-card rounded-[24px] overflow-hidden mx-6 md:mx-0">
        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col divide-y divide-white/40">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex flex-col gap-3 hover:bg-white/20 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-[#1a202c] mb-0.5">{tx.id.split("-")[0]}</p>
                  <p className="text-[10px] font-bold text-[#718096]">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase shadow-sm ${tx.type === 'commission' ? 'bg-gradient-to-r from-[#d32f2f] to-[#8bc1c1] text-white' : tx.type === 'payment' ? 'bg-[#43e97b]/20 text-[#28a745]' : tx.type === 'refund' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {tx.type}
                </span>
              </div>
              <div className="flex justify-between items-end mt-1 bg-white/20 p-3 rounded-xl border border-white/40">
                <div className="flex flex-col gap-2 relative">
                  <div>
                    <span className="text-[10px] text-[#a0aec0] uppercase tracking-wider block leading-tight">User</span>
                    <p className="text-xs font-bold text-[#4a5568] truncate max-w-[120px]">{(tx.users as any)?.name || "System"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#a0aec0] uppercase tracking-wider block leading-tight">Booking Ref</span>
                    <p className="text-xs font-bold text-[#a0aec0]">{tx.booking_id?.split("-")[0] || "N/A"}</p>
                  </div>
                </div>
                <div className="text-right pb-1">
                  <span className="text-[10px] text-[#a0aec0] uppercase tracking-wider block mb-0.5 leading-tight">Amount</span>
                  <p className="text-sm font-extrabold text-[#d32f2f]">
                    {tx.type === 'refund' || tx.type === 'payout' ? "-" : "+"} ৳{Math.round(tx.amount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Trans ID / Date</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">User</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Booking Ref</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Type</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/40 hover:bg-white/20 transition-colors">
                  <td className="p-5">
                    <p className="text-sm font-extrabold text-[#1a202c] mb-1">{tx.id.split("-")[0]}</p>
                    <p className="text-xs font-bold text-[#718096]">{new Date(tx.created_at).toLocaleString()}</p>
                  </td>
                  <td className="p-5 text-sm font-bold text-[#4a5568]">
                    {(tx.users as any)?.name || "System"}
                  </td>
                  <td className="p-5 text-xs font-bold text-[#a0aec0]">
                    {tx.booking_id?.split("-")[0] || "N/A"}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${tx.type === 'commission' ? 'bg-gradient-to-r from-[#d32f2f] to-[#8bc1c1] text-white' : tx.type === 'payment' ? 'bg-[#43e97b]/20 text-[#28a745]' : tx.type === 'refund' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-5 text-sm font-extrabold text-[#d32f2f] text-right">
                    {tx.type === 'refund' || tx.type === 'payout' ? "-" : "+"} ৳{Math.round(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination totalItems={totalCount} itemsPerPage={ITEMS_PER_PAGE} />
    </div>
  );
}
