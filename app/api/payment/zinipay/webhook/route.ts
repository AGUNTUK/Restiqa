import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyZiniPayment } from "@/lib/zinipay";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Parse request body from ZiniPay
    const body = await request.json();
    const { invoiceId, metadata } = body;
    const bookingId = metadata?.bookingId || body.orderId;

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    // 2. Verify payment with ZiniPay
    // We call the verify API to double-check the status and get official data
    const ziniResponse = await verifyZiniPayment(invoiceId);

    if (ziniResponse.status === "success" && ziniResponse.data) {
      const paymentData = ziniResponse.data;
      
      // 3. Security Check: Use admin-level access if possible or ensure booking exists
      // Since this is a webhook, we might need a service role or check ownership
      // For now, we'll fetch the booking by ID
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("id, status, user_id, total_amount, total_price")
        .eq("id", bookingId)
        .single();

      if (fetchError || !booking) {
        console.error("Webhook Error: Booking not found", bookingId);
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      // 4. Idempotency Check: Don't process if already paid
      if (booking.status === "confirmed") {
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      // 5. Update booking status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          payment_status: "paid",
          // Update actual received amount if needed
          // total_amount: paymentData.amount
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Webhook Error: Failed to update booking", updateError);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
      }

      // 6. Record the transaction
      await supabase.from("transactions").insert({
        booking_id: bookingId,
        user_id: booking.user_id,
        amount: Number(paymentData.amount),
        type: "payment",
        status: "completed",
        gateway_transaction_id: paymentData.transactionId,
        // method: paymentData.paymentMethod
      });

      console.log(`ZiniPay Webhook Success: Booking ${bookingId} confirmed.`);
      return NextResponse.json({ success: true });

    } else {
      console.warn("ZiniPay Webhook: Verification failed or payment not success", ziniResponse);
      return NextResponse.json({ success: false, message: "Payment not verified" }, { status: 200 });
    }

  } catch (error) {
    console.error("ZiniPay Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
