"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { sendPaymentReceiptEmail } from "@/lib/email";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  
  return supabase;
}

export async function approvePayment(transactionId: string) {
  try {
    const supabase = await requireAdmin();

    // Get the transaction to find the booking_id
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select("booking_id, amount, gateway_transaction_id, user_id, users(email)")
      .eq("id", transactionId)
      .single();

    if (txError || !tx) throw new Error("Transaction not found");

    // Approve the transaction
    await supabase
      .from("transactions")
      .update({ status: "success" }) // Changed from pending verification
      .eq("id", transactionId);

    // Approve the booking
    await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        status: "confirmed"
      })
      .eq("id", tx.booking_id);

    // Firing Notification and Simulated Email!
    const userEmail = (tx.users as any)?.email;
    const amount = Number(tx.amount) || 0;
    const baseLink = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    await Promise.allSettled([
      createNotification(
        tx.user_id,
        "Payment Verified",
        `Your physical transfer of ৳${amount} for booking ${tx.booking_id.substring(0,6)} was securely verified.`,
        "success",
        `/trip/${tx.booking_id}`
      ),
      sendPaymentReceiptEmail({
        to: userEmail || "guest@restiqa.com",
        subject: "Payment Verified - Restiqa Reservations",
        amount,
        transactionId: tx.gateway_transaction_id || transactionId,
        status: "verified",
        bookingLink: `${baseLink}/trip/${tx.booking_id}`
      })
    ]);

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve payment:", error);
    return { error: error.message || "Failed to approve payment" };
  }
}

export async function rejectPayment(transactionId: string) {
  try {
    const supabase = await requireAdmin();

    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select("booking_id, amount, gateway_transaction_id, user_id, users(email)")
      .eq("id", transactionId)
      .single();

    if (txError || !tx) throw new Error("Transaction not found");

    // Reject the transaction
    await supabase
      .from("transactions")
      .update({ status: "rejected" }) 
      .eq("id", transactionId);

    // Cancel or fail the booking
    await supabase
      .from("bookings")
      .update({
        payment_status: "failed",
        status: "cancelled"
      })
      .eq("id", tx.booking_id);

    // Notifications & Email
    const userEmail = (tx.users as any)?.email;
    const amount = Number(tx.amount) || 0;
    
    await Promise.allSettled([
      createNotification(
        tx.user_id,
        "Payment Rejected",
        `Your declared payment of ৳${amount} could not be successfully verified by platform administrators. Your booking has been temporarily halted.`,
        "error",
        `/dashboard`
      ),
      sendPaymentReceiptEmail({
        to: userEmail || "guest@restiqa.com",
        subject: "Payment Verification Failed - Restiqa",
        amount,
        transactionId: tx.gateway_transaction_id || transactionId,
        status: "rejected"
      })
    ]);

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to reject payment:", error);
    return { error: error.message || "Failed to reject payment" };
  }
}
