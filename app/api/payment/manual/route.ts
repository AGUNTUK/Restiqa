import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1.5 Extract network signatures
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown";
    const deviceInfo = request.headers.get("user-agent") || "Unknown";

    // 2. Parse request body
    const body = await request.json();
    const { bookingId, transactionId, senderNumber, amountPaid, transactionTime, method } = body;

    if (!bookingId || !transactionId || !senderNumber || amountPaid === undefined || !transactionTime || !method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2.1 Rate Limiting (Max 3 attempts per 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
    const { count: recentAttempts } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("submitted_at", fiveMinutesAgo);

    if (recentAttempts !== null && recentAttempts >= 3) {
      return NextResponse.json(
        { error: "Too many attempts, try later" },
        { status: 429 }
      );
    }

    // 2.5 Fraud Detection Setup
    let riskLevel: "safe" | "suspicious" | "high risk" | "rejected" = "safe";

    // 2.5a Check if transaction ID is already used
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id")
      .eq("gateway_transaction_id", transactionId)
      .maybeSingle();

    let finalTransactionId = transactionId;
    if (existingTx) {
      riskLevel = "rejected";
      // We must bypass the unique constraint in the database to successfully log this high-risk fraud attempt
      finalTransactionId = `${transactionId}-DUP-${Date.now()}`;
    }

    // 3. Security Check
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, status, total_amount, total_price, user_id")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found or access denied" }, { status: 404 });
    }

    if (booking.status !== "pending") {
      return NextResponse.json({ error: "Booking is not in pending state" }, { status: 400 });
    }

    const baseAmount = booking.total_amount || booking.total_price;
    const commission = Number(baseAmount) * 0.10;
    const hostEarnings = Number(baseAmount) - commission;

    // Include the deterministic 1-9 BDT unique payment offset required for verification
    const uniqueOffset = (parseInt(bookingId.slice(-1), 16) % 9) + 1;
    const expectedAmount = Number(baseAmount) + uniqueOffset;

    // Check for suspicious amount discrepancy (tolerance of ±1 BDT)
    const amountDiff = Math.abs(Number(amountPaid) - expectedAmount);
    const isMismatch10Percent = amountDiff > (expectedAmount * 0.10);
    const isSuspiciousAmount = amountDiff > 1;

    if (isMismatch10Percent) {
      riskLevel = "rejected";
    } else if (isSuspiciousAmount && riskLevel === "safe") {
      riskLevel = "suspicious";
    }

    // Check for suspicious timing (> 15 minutes older than now)
    const txDate = new Date(transactionTime);
    const now = new Date();
    const diffMinutes = (now.getTime() - txDate.getTime()) / (1000 * 60);
    const isSuspiciousTime = diffMinutes > 15 || diffMinutes < -5; 
    if (isSuspiciousTime && riskLevel === "safe") riskLevel = "suspicious";

    // Check if the sender number has a history of suspicious/high risk transactions
    const { count: suspiciousCount } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("sender_number", senderNumber)
      .in("status", ["suspicious", "high risk"]);

    if (suspiciousCount && suspiciousCount > 0 && riskLevel === "safe") {
      riskLevel = "suspicious";
    }

    // Check for too many attempts in short time (e.g. > 3 attempts in 15 mins)
    const { count: recentTxCount } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("submitted_at", new Date(now.getTime() - 15 * 60000).toISOString());
    if (recentTxCount && recentTxCount >= 3) {
      riskLevel = "rejected"; // Override to rejected
    }

    // Check for multiple bookings from same user quickly (e.g. > 2 bookings in 1 hour)
    const { count: recentBookingCount } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", new Date(now.getTime() - 60 * 60000).toISOString());
    if (recentBookingCount && recentBookingCount > 2) {
      riskLevel = "high risk"; // Override to high risk
    }

    const txStatus = riskLevel;

    // 4. Update the booking status to pending_verification or failed
    const newPaymentStatus = txStatus === "rejected" ? "failed" : "pending_verification";

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        total_amount: expectedAmount,
        commission_amount: commission,
        host_earnings: hostEarnings,
        payment_status: newPaymentStatus,
        status: "pending",
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking state:", updateError);
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    // 5. Record the transaction
    const { data: txRecord, error: txError } = await supabase
      .from("transactions")
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        amount: Number(amountPaid), // Save the actual submitted amount
        type: "payment",
        status: txStatus,
        gateway_transaction_id: finalTransactionId,
        sender_number: senderNumber,
        created_at: txDate.toISOString(),
        submitted_at: now.toISOString()
      })
      .select("id")
      .single();

    if (txError) {
      console.error("Error creating transaction record:", txError);
    } else if (txRecord) {
      // 6. Record the network fraud tracking log
      const { error: logError } = await supabase
        .from("payment_logs")
        .insert({
          user_id: user.id,
          booking_id: bookingId,
          transaction_id: txRecord.id,
          ip_address: ipAddress,
          device_info: deviceInfo
        });
        
      if (logError) {
        console.error("Error creating payment log:", logError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Manual Payment API Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
