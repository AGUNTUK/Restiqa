import { createClient } from "@/lib/supabase/server";
import PaymentActionButtons from "./PaymentActionButtons";
import Link from "next/link";

export const metadata = {
  title: "Admin - Pending Payments",
  description: "Verify Manual Transactions",
};

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const resolvedParams = await searchParams;
  const filter = resolvedParams?.filter || "all";
  
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select(`
      id,
      amount,
      status,
      created_at,
      submitted_at,
      gateway_transaction_id,
      sender_number,
      booking_id,
      users!transactions_user_id_fkey(full_name, email),
      bookings(created_at, total_price, total_amount)
    `)
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("status", filter);
  } else {
    query = query.in("status", ["pending", "pending verification", "safe", "suspicious", "high risk"]);
  }

  const { data: transactions, error } = await query;

  if (error) {
    console.error("Failed to load pending payments:", error);
    return <div className="p-8 text-red-500">Failed to load transactions.</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Payment Verification</h1>
          <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Approve manual payments submitted by users</p>
        </div>
        
        {/* URL Parameter Filter UI */}
        <div className="flex flex-wrap gap-2">
           <Link href="?filter=all" className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-extrabold transition-all border border-transparent shadow-sm ${filter === "all" ? "bg-[#1a202c] text-white" : "bg-white text-[#718096] hover:border-gray-300"}`}>All</Link>
           <Link href="?filter=safe" className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-extrabold transition-all border border-transparent shadow-sm ${filter === "safe" ? "bg-green-600 text-white" : "bg-white text-[#718096] hover:border-green-300"}`}>Safe</Link>
           <Link href="?filter=suspicious" className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-extrabold transition-all border border-transparent shadow-sm ${filter === "suspicious" ? "bg-orange-500 text-white" : "bg-white text-[#718096] hover:border-orange-300"}`}>Suspicious</Link>
           <Link href="?filter=high risk" className={`px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-extrabold transition-all border border-transparent shadow-sm ${filter === "high risk" ? "bg-red-600 text-white" : "bg-white text-[#718096] hover:border-red-300"}`}>High Risk</Link>
        </div>
      </div>

      <div className="mx-6 md:mx-8 neo-card rounded-[24px] overflow-hidden">
        {(!transactions || transactions.length === 0) ? (
          <div className="p-12 text-center text-[#718096] font-bold">
            No matching transactions found. 
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white/40 border-b border-white/60">
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">User Details</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Transaction ID</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Sender Number</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Amount</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-center">Status & Flags</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => {
                  const txBooking = tx.bookings;
                  const expectedAmount = txBooking?.total_amount || txBooking?.total_price || 0;
                  const txTime = new Date(tx.created_at).getTime();
                  const bookingTime = new Date(txBooking?.created_at || tx.created_at).getTime();
                  const timeDiffMinutes = (txTime - bookingTime) / (1000 * 60);

                  const isAmountMatch = expectedAmount > 0 && Math.abs(tx.amount - expectedAmount) < 1; 
                  const isRecent = timeDiffMinutes >= 0 && timeDiffMinutes <= 120;
                  const isLikelyValid = isAmountMatch && isRecent && (tx.status === "safe" || tx.status === "pending verification");

                  // Compute fraud reasons dynamically
                  const fraudReasons: string[] = [];
                  if (tx.gateway_transaction_id?.includes("-DUP-")) {
                    fraudReasons.push("Duplicate TrxID");
                  }
                  if (expectedAmount > 0 && Math.abs(tx.amount - expectedAmount) > 1) {
                    fraudReasons.push("Wrong Amount");
                  }
                  if (tx.submitted_at) {
                    const submitTime = new Date(tx.submitted_at).getTime();
                    const submissionAgeMinutes = (submitTime - txTime) / (1000 * 60);
                    if (submissionAgeMinutes > 15 || submissionAgeMinutes < -5) {
                      fraudReasons.push("Too Old");
                    }
                  }

                  const isRisky = tx.status === "suspicious" || tx.status === "high risk";

                  return (
                    <tr 
                      key={tx.id} 
                      className={`border-b transition-colors ${isRisky ? "bg-red-50/60 border-red-100 hover:bg-red-100/60" : "border-white/40 hover:bg-white/20"}`}
                    >
                      <td className="p-5">
                      <p className="text-sm font-extrabold text-[#1a202c]">{tx.users?.full_name || "Unknown User"}</p>
                      <p className="text-xs font-medium text-[#718096]">{tx.users?.email || ""}</p>
                      <p className="text-[10px] text-[#a0aec0] mt-1 font-mono">Booking Ref: {tx.booking_id?.split("-")[0]}</p>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-[#4a5568] tracking-widest font-mono">
                        {tx.gateway_transaction_id?.replace(/-DUP-\d+/g, "") || "N/A"}
                      </p>
                      <p className="text-[10px] text-[#a0aec0] font-bold mt-1 uppercase tracking-widest">
                        Tx: {new Date(tx.created_at).toLocaleString()}
                      </p>
                      {tx.submitted_at && (
                        <p className="text-[10px] text-[#a0aec0] font-bold mt-0.5 uppercase tracking-widest">
                          Sub: {new Date(tx.submitted_at).toLocaleString()}
                        </p>
                      )}
                      {isLikelyValid && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#43e97b]/10 text-[#28a745] rounded-md text-[10px] font-extrabold uppercase tracking-widest border border-[#43e97b]/20">
                          <span className="text-xs">🌟</span> Likely valid
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1.5 bg-blue-100/50 text-blue-700 rounded-lg text-sm font-bold tracking-widest font-mono">
                        {tx.sender_number || "N/A"}
                      </span>
                    </td>
                    <td className="p-5 text-lg font-extrabold text-[#1a202c] text-right">
                      ৳{Math.round(tx.amount)}
                      {!isAmountMatch && expectedAmount > 0 && (
                        <div className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-widest">
                          Expected: ৳{Math.round(expectedAmount)}
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${
                          tx.status === "high risk" 
                            ? "bg-red-600 text-white shadow-red-500/30"
                            : tx.status === "suspicious" 
                            ? "bg-orange-500 text-white shadow-orange-500/30" 
                            : tx.status === "safe" || tx.status === "pending verification"
                            ? "bg-green-500 text-white shadow-green-500/30"
                            : "bg-gray-300 text-gray-800"
                        }`}>
                          {tx.status}
                        </span>
                        
                        {/* Render Fraud Reasons */}
                        {fraudReasons.length > 0 && (
                          <div className="flex flex-col items-center gap-1 mt-1">
                            {fraudReasons.map((reason, idx) => (
                              <span key={idx} className="text-[9px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded-md uppercase tracking-wider border border-red-200">
                                ⚠ {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <PaymentActionButtons transactionId={tx.id} />
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
