"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function releasePayout(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify Admin Role securely
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
     throw new Error("Unauthorized: Admin access required");
  }

  const bookingId = formData.get("bookingId") as string;
  if (!bookingId) throw new Error("Missing booking ID");

  // Fetch the booking details
  // Note: For a true admin, you would verify user.email is an admin here.
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*, listings(host_id)")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    throw new Error("Booking not found");
  }

  if (booking.payout_status === "released") {
    throw new Error("Payout already released!");
  }

  const { getPlatformSettings } = await import("@/lib/settings");
  const settings = await getPlatformSettings();
  const scale = settings.commission_rate;

  const hostId = (booking.listings as any).host_id;
  const hostEarnings = booking.host_earnings || (booking.total_price * (1 - scale));
  const commission = booking.commission_amount || (booking.total_price * scale);

  // 1. Update payout status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ payout_status: "released" })
    .eq("id", bookingId);

  if (updateError) throw new Error("Failed to update payout status");

  // 2. Insert payout record
  await supabase.from("payouts").insert({
    host_id: hostId,
    amount: hostEarnings,
    status: "completed",
    method: "bank"
  });

  // 3. Insert transactions logically
  await supabase.from("transactions").insert([
    {
      booking_id: bookingId,
      user_id: hostId,
      amount: hostEarnings,
      type: "payout",
      status: "completed"
    },
    {
      booking_id: bookingId,
      user_id: user.id, // Logged against admin user
      amount: commission,
      type: "commission",
      status: "completed"
    }
  ]);

  revalidatePath("/admin/payouts");
}

export async function toggleUserStatus(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized: Admin access required");

  const targetUserId = formData.get("userId") as string;
  const currentStatus = formData.get("currentStatus") === "true"; // string boolean

  const { error } = await supabase.from("users").update({ is_active: !currentStatus }).eq("id", targetUserId);
  if (error) throw new Error("Failed to update user status");

  revalidatePath("/admin/users");
}

export async function updateListingStatus(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized: Admin access required");

  const listingId = formData.get("listingId") as string;
  const status = formData.get("status") as string;

  const { error } = await supabase.from("listings").update({ status }).eq("id", listingId);
  if (error) throw new Error("Failed to update listing status");

  revalidatePath("/admin/listings");
}
export async function approveHostApplication(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized: Admin access required");

  const appId = formData.get("applicationId") as string;
  if (!appId) throw new Error("Missing application ID");

  // 1. Fetch application details
  const { data: app, error: fetchError } = await supabase
    .from("host_applications")
    .select("*, listings(id)")
    .eq("id", appId)
    .single();

  if (fetchError || !app) throw new Error("Application not found");

  // 2. Update User Role
  const { error: userError } = await supabase
    .from("users")
    .update({ role: "host" })
    .eq("id", app.user_id);

  if (userError) throw new Error("Failed to update user role");

  // 3. Approve Listing
  if (app.listing_id) {
    const { error: listingError } = await supabase
      .from("listings")
      .update({ status: "approved" })
      .eq("id", app.listing_id);
    
    if (listingError) console.error("Failed to approve listing during host application approval");
  }

  // 4. Mark Application as Approved
  const { error: appUpdateError } = await supabase
    .from("host_applications")
    .update({ status: "approved" })
    .eq("id", appId);

  if (appUpdateError) throw new Error("Failed to update application status");

  revalidatePath("/admin/applications");
  revalidatePath("/admin/users");
  revalidatePath("/admin/listings");
}

export async function rejectHostApplication(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized: Admin access required");

  const appId = formData.get("applicationId") as string;
  const reason = formData.get("reason") as string;
  if (!appId) throw new Error("Missing application ID");

  // 1. Fetch application to get listing_id
  const { data: app } = await supabase.from("host_applications").select("listing_id").eq("id", appId).single();

  // 2. Mark Application as Rejected
  const { error: appUpdateError } = await supabase
    .from("host_applications")
    .update({ 
      status: "rejected",
      admin_message: reason 
    })
    .eq("id", appId);

  if (appUpdateError) throw new Error("Failed to reject application");

  // 3. Optionally reject the listing too
  if (app?.listing_id) {
    await supabase.from("listings").update({ status: "rejected" }).eq("id", app.listing_id);
  }

  revalidatePath("/admin/applications");
}
