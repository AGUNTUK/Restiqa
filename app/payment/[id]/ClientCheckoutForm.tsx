"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

interface ClientCheckoutFormProps {
  bookingId: string;
  amount: number;
  dict: any;
}

export default function ClientCheckoutForm({ bookingId, amount, dict }: ClientCheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState("bkash");
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionTime, setTransactionTime] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [copied, setCopied] = useState(false);

  // Hardcoded payment details for demonstration
  const paymentDetails: Record<string, { label: string; value: string }> = {
    bkash: { label: "bKash Personal Number", value: "01787916775" },
    nagad: { label: "Nagad Personal Number", value: "01787916775" },
    upay: { label: "Upay Personal Number", value: "01787916775" },
    bank: { label: "DBBL Bank Account", value: "1041030115084" },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentDetails[method].value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber.trim()) {
      setError("Please enter your Sender Number.");
      return;
    }
    if (!amountPaid || isNaN(Number(amountPaid)) || Number(amountPaid) <= 0) {
      setError("Please enter a valid amount paid.");
      return;
    }
    if (!transactionId.trim()) {
      setError("Please enter a valid Transaction ID.");
      return;
    }
    if (!transactionTime) {
      setError("Please select the approximate time you completed the payment.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, method, senderNumber, amountPaid: Number(amountPaid), transactionId, transactionTime }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm payment");
      }

      // Success
      router.push(`/payment/success?bookingId=${bookingId}`);
      
    } catch (err: any) {
      console.error("Payment confirmation error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="w-full max-w-lg mx-auto">
      <PaymentMethodSelector 
        dict={dict} 
        onSelect={(m) => { setMethod(m); setError(null); }} 
      />

      {/* Custom Payment UI Section */}
      <div className="bg-[#f0f3f8] p-6 rounded-[24px] mb-8 shadow-[inset_4px_4px_8px_#c4c9ce,inset_-4px_-4px_8px_#ffffff] space-y-6">
        <div>
          <h4 className="text-sm font-bold text-[#718096] uppercase tracking-wider mb-2">
            {paymentDetails[method].label}
          </h4>
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-2xl font-extrabold text-[#1a202c] tracking-tight">
              {paymentDetails[method].value}
            </span>
            <button 
              type="button" 
              onClick={handleCopy}
              className="p-2.5 bg-[#f0f3f8] rounded-lg shadow-[2px_2px_5px_#c4c9ce,-2px_-2px_5px_#ffffff] text-[#d32f2f] hover:text-[#5a52d5] active:shadow-[inset_2px_2px_5px_#c4c9ce,inset_-2px_-2px_5px_#ffffff] transition-all flex items-center justify-center"
              aria-label="Copy number"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              )}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200/50">
          <p className="text-[15px] text-[#4a5568] font-medium leading-relaxed mb-5">
            Please send exactly <strong className="text-[#d32f2f] font-extrabold">{dict.common.currency}{amount}</strong> to the account above, then enter the Transaction ID below to verify your payment.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="sender_number" className="block text-sm font-bold text-[#4a5568] uppercase tracking-wider">
                Sender Number
              </label>
              <input
                id="sender_number"
                type="text"
                placeholder="e.g. 017XXXXXXXX"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-transparent focus:border-[#d32f2f] focus:ring-4 focus:ring-[#d32f2f]/10 outline-none transition-all font-mono text-lg shadow-sm text-[#1a202c] placeholder:text-gray-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="amount_paid" className="block text-sm font-bold text-[#4a5568] uppercase tracking-wider">
                Amount Paid {dict.common.currency && `(${dict.common.currency})`}
              </label>
              <input
                id="amount_paid"
                type="number"
                step="0.01"
                placeholder={`e.g. ${amount}`}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-transparent focus:border-[#d32f2f] focus:ring-4 focus:ring-[#d32f2f]/10 outline-none transition-all font-mono text-lg shadow-sm text-[#1a202c] placeholder:text-gray-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tx_id" className="block text-sm font-bold text-[#4a5568] uppercase tracking-wider">
                Transaction ID
              </label>
              <input
                id="tx_id"
                type="text"
                placeholder="e.g. 7X9A2B3D4"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-transparent focus:border-[#d32f2f] focus:ring-4 focus:ring-[#d32f2f]/10 outline-none transition-all font-mono text-lg uppercase shadow-sm text-[#1a202c] placeholder:text-gray-300"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tx_time" className="block text-sm font-bold text-[#4a5568] uppercase tracking-wider">
                Payment Time
              </label>
              <input
                id="tx_time"
                type="datetime-local"
                value={transactionTime}
                onChange={(e) => setTransactionTime(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white border-2 border-transparent focus:border-[#d32f2f] focus:ring-4 focus:ring-[#d32f2f]/10 outline-none transition-all font-mono text-lg shadow-sm text-[#1a202c]"
                required
              />
            </div>
            
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm font-bold text-red-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </p>
        </div>
      )}

        <button 
          type="submit" 
          disabled={loading || !transactionId.trim() || !amountPaid || !senderNumber.trim() || !transactionTime}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
            loading || !transactionId.trim() || !amountPaid || !senderNumber.trim() || !transactionTime
              ? 'bg-gray-100 text-gray-400 shadow-[inset_4px_4px_8px_#c4c9ce,inset_-4px_-4px_8px_#ffffff] cursor-not-allowed'
              : 'bg-[#d32f2f] text-white shadow-[6px_6px_12px_#c4c9ce,-6px_-6px_12px_#ffffff] hover:bg-[#5a52d5] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]'
          }`}
        >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verifying...</span>
          </>
        ) : (
          <span>Confirm Payment</span>
        )}
      </button>
    </form>
  );
}
