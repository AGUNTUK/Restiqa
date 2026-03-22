"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface BookingDetails {
  id: string;
  total_price: number;
  total_amount?: number;
  payment_status: string;
  status: string;
  listings: {
    title: string;
    city: string;
    images?: string[];
  } | null;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transaction_id = searchParams.get("transaction_id") || searchParams.get("tran_id");
  const bookingId = searchParams.get("bookingId");

  const [status, setStatus] = useState<"loading" | "verifying" | "success" | "error" | "failed">("loading");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [verifyTextIndex, setVerifyTextIndex] = useState(0);

  const verifyTexts = [
    "Establishing secure connection...",
    "Validating transaction details...",
    "Awaiting confirmation...",
    "Finalizing payment..."
  ];

  useEffect(() => {
    // Cycle verification text
    if (status === "verifying") {
      const textInterval = setInterval(() => {
        setVerifyTextIndex((prev) => (prev + 1) % verifyTexts.length);
      }, 3000);
      return () => clearInterval(textInterval);
    }
  }, [status, verifyTexts.length]);

  useEffect(() => {
    if (!bookingId) {
      setStatus("error");
      setErrorMessage("No booking ID found. Please check your dashboard.");
      return;
    }

    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            id, 
            total_price, 
            total_amount, 
            payment_status,
            status,
            listings (
              title,
              city,
              images
            )
          `)
          .eq("id", bookingId)
          .single();

        if (error || !data) {
          throw new Error("Could not fetch booking state.");
        }

        setBooking(data as unknown as BookingDetails);

        if (data.payment_status === "paid") {
          setStatus("success");
          if (pollInterval) clearInterval(pollInterval);
        } else if (data.payment_status === "failed" || data.status === "cancelled") {
          setStatus("failed");
          setErrorMessage("Your payment was rejected or verification failed.");
          if (pollInterval) clearInterval(pollInterval);
        } else if (data.payment_status === "pending_verification" || data.payment_status === "pending") {
          setStatus("verifying");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
      }
    };

    // Immediate check
    checkStatus();

    // Set up polling every 5 seconds
    pollInterval = setInterval(() => {
      checkStatus();
    }, 5000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [bookingId]);

  if (status === "loading" || status === "verifying") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <div className="neo-card max-w-sm w-full p-8 md:p-10 rounded-[32px] text-center flex flex-col items-center space-y-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full border-4 border-[#6c63ff]/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute inset-2 rounded-full border-4 border-[#6c63ff]/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>
            
            {/* Core spinner */}
            <div className="w-16 h-16 border-4 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin"></div>
            
            {/* Lock icon in center */}
            <svg className="absolute w-6 h-6 text-[#6c63ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="11" width="14" height="10" rx="2" ry="2" strokeWidth={2.5} />
              <path d="M8 11V7a4 4 0 018 0v4" strokeWidth={2.5} strokeLinecap="round" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-xl font-extrabold text-[#1a202c] mb-2">Verifying Payment</h2>
            <p className="text-[#a0aec0] font-bold text-sm h-5 transition-opacity duration-500">
              {status === "verifying" ? verifyTexts[verifyTextIndex] : "Loading secure gateway..."}
            </p>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#6c63ff] h-1.5 rounded-full animate-[indeterminate_2s_ease-in-out_infinite] w-1/2"></div>
          </div>
          
          <p className="text-[10px] uppercase tracking-widest text-[#a0aec0] font-bold">
            Auto-refreshing • Do not close this page
          </p>
        </div>
      </div>
    );
  }

  if (status === "error" || status === "failed") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
        <div className="neo-card max-w-md w-full p-8 md:p-10 rounded-[32px] text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-[#1a202c] mb-4">Verification Failed</h2>
          <p className="text-[#4a5568] font-bold mb-8">{errorMessage}</p>
          <Link href="/dashboard" className="w-full py-4 px-6 bg-[#1a202c] hover:bg-[#2d3748] text-white font-bold rounded-2xl shadow-[4px_4px_10px_#c4c9ce,-4px_-4px_10px_#ffffff] transition-all block text-center">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  const amountPaid = booking?.total_amount || booking?.total_price || "---";
  const propertyTitle = booking?.listings?.title || "Property";
  const propertyCity = booking?.listings?.city || "";
  const propertyImage = booking?.listings?.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="neo-card max-w-md w-full p-8 md:p-10 rounded-[32px] text-center relative overflow-hidden">
        
        {/* Background confeti style elements */}
        <div className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-[#43e97b]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-[#6c63ff]/10 rounded-full blur-xl"></div>

        {/* Success Icon */}
        <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-[#43e97b] to-[#38f9d7] rounded-full flex items-center justify-center mb-6 shadow-[0_8px_16px_rgba(67,233,123,0.3)]">
          <svg className="w-12 h-12 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-[#1a202c] tracking-tight mb-2">Payment Confirmed!</h1>
        <p className="text-[#a0aec0] mb-8 font-bold text-sm tracking-wide">YOUR BOOKING IS SECURED</p>
        
        {/* Receipt Box */}
        <div className="neo-inset p-5 rounded-2xl mb-8 text-left relative overflow-hidden bg-white/50 border border-white/60">
          <div className="flex gap-4 items-center mb-5 border-b border-[#e2e8f0]/60 pb-5">
            <div className="w-16 h-16 relative rounded-2xl overflow-hidden shrink-0 shadow-sm">
              <Image src={propertyImage} alt={propertyTitle} fill className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[#a0aec0] uppercase tracking-widest mb-1">{propertyCity}</p>
              <h3 className="font-extrabold text-[#2d3748] text-sm leading-tight line-clamp-2">{propertyTitle}</h3>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-extrabold text-[#a0aec0] uppercase tracking-widest mb-1">Amount Paid</p>
              <p className="text-2xl font-black text-[#6c63ff]">৳{amountPaid}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center justify-center px-4 py-1.5 bg-[#43e97b]/10 text-[#28a745] font-extrabold text-[10px] uppercase tracking-widest rounded-lg border border-[#43e97b]/20">
                Success
              </span>
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="w-full py-4 px-6 bg-[#6c63ff] hover:bg-[#5a52d5] text-white font-bold rounded-2xl shadow-[6px_6px_12px_#c4c9ce,-6px_-6px_12px_#ffffff] transition-all transform active:scale-95 block text-center uppercase tracking-widest text-sm">
          View Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
