"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePlatformSettings(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Authenticate user & ensure Admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return { error: "Unauthorized: Admin access required" };

    const commissionRateRaw = formData.get("commission_rate") as string;
    const manualPaymentsFlag = formData.get("manual_payments_enabled") as string;

    const commissionRate = Number(commissionRateRaw) / 100; // Parse "15" -> 0.15

    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 1) {
      return { error: "Invalid commission rate. Must be between 0 and 100." };
    }

    const { error } = await supabase
      .from("platform_settings")
      .update({
        commission_rate: commissionRate,
        manual_payments_enabled: manualPaymentsFlag === "on",
        updated_at: new Date().toISOString()
      })
      .eq("id", 1);

    if (error) {
      console.error("Setting update error:", error.message);
      return { error: "Database failed to save settings." };
    }

    // Force Next.js router invalidation across all apps
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (err: any) {
    console.error("Settings Action Exception:", err);
    return { error: "Internal Server Error updating settings" };
  }
}
