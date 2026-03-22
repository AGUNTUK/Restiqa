"use client";

import { useState } from "react";
import { approvePayment, rejectPayment } from "./actions";

export default function PaymentActionButtons({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this payment? This will confirm the booking.")) return;
    setLoading(true);
    await approvePayment(transactionId);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this payment? The booking will be cancelled.")) return;
    setLoading(true);
    await rejectPayment(transactionId);
    setLoading(false);
  };

  return (
    <div className="flex gap-2 items-center justify-end">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="px-4 py-2 bg-[#43e97b] text-white text-xs font-bold rounded-lg hover:bg-[#34d86c] disabled:opacity-50 transition-colors shadow-sm"
      >
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors shadow-sm"
      >
        Reject
      </button>
    </div>
  );
}
