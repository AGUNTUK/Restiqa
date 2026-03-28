import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyZiniPayment } from "@/lib/zinipay";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { invoiceId, bookingId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    // 3. Verify payment with ZiniPay
    const ziniResponse = await verifyZiniPayment(invoiceId);

    if (ziniResponse.status === "success" && ziniResponse.data) {
      const paymentData = ziniResponse.data;
      
      // 4. Security Check: Verify booking ownership
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("id, status, user_id, total_amount, total_price")
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !booking) {
        return NextResponse.json({ error: "Booking not found or access denied" }, { status: 404 });
      }

      // 5. Update booking status if not already confirmed
      if (booking.status !== "confirmed") {
        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid"
          })
          .eq("id", bookingId);

        if (updateError) {
          console.error("Verification Error: Failed to update booking", updateError);
          return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
        }

        // 6. Record the transaction if not already recorded
        const { data: existingTx } = await supabase
          .from("transactions")
          .select("id")
          .eq("gateway_transaction_id", paymentData.transactionId)
          .maybeSingle();

        if (!existingTx) {
          await supabase.from("transactions").insert({
            booking_id: bookingId,
            user_id: user.id,
            amount: Number(paymentData.amount),
            type: "payment",
            status: "completed",
            gateway_transaction_id: paymentData.transactionId,
          });
        }
      }

      return NextResponse.json({ success: true, data: paymentData });

    } else {
      console.warn("ZiniPay Verification Failed:", ziniResponse);
      return NextResponse.json({ 
        success: false, 
        error: ziniResponse.message || "Payment could not be verified" 
      }, { status: 200 });
    }

  } catch (error) {
    console.error("ZiniPay Verify API Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
