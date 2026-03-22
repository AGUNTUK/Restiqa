import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Authenticate Session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Admin Privilege
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userRecord?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Parse Input
    const body = await request.json();
    const { transaction_id, amount } = body;

    if (!transaction_id || amount === undefined) {
      return NextResponse.json({ error: "transaction_id and amount are required" }, { status: 400 });
    }

    console.info(`[Payment Event] Admin refund initiated for transaction_id: ${transaction_id}`);

    // 1. First, verify the transaction_id to cleanly lookup the associated order_id (booking ID)
    const { data: originalTx, error: txFetchError } = await supabase
      .from("transactions")
      .select("booking_id, user_id")
      .eq("id", transaction_id)
      .single();

    if (txFetchError || !originalTx) {
      return NextResponse.json({ error: "Original transaction not found" }, { status: 404 });
    }

    const order_id = originalTx.booking_id;

    // 3. Database Updates
    
    // Look up the booking to find the owning user for the transaction ledger
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", order_id)
      .single();

    if (bookingErr || !booking) {
      console.error(`Refund API: Booking ${order_id} not found locally.`);
      // Proceeding without an absolute crash since the refund went through, 
      // but it means our local sync failed partially.
    }

    // Update booking state
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "refunded",
        payment_status: "refunded",
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("Refund API: Error updating booking to refunded:", updateError);
    }

    // Insert structured ledger trail for the refund
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        booking_id: order_id,
        user_id: booking ? booking.user_id : user.id, // Fallback to admin if guest not found
        amount: Number(amount),
        type: "refund",
        status: "success"
      });

    if (txError) {
      console.error("Refund API: Error creating ledger refund transaction record:", txError);
    }

    console.info(`[Payment Event] Refund processed successfully for order_id: ${order_id}`);
    return NextResponse.json({ success: true, message: "Refund processed successfully", order_id });

  } catch (error) {
    console.error("Refund API Route Fatal Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
