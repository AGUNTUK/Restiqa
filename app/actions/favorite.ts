"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(listingId: string): Promise<{ success?: boolean; error?: string; action?: 'added' | 'removed' }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "You must be logged in to save listings." };

    // Check if already favorited
    const { data: existing } = await supabase
      .from("saved_listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .single();

    if (existing) {
      // Remove it
      const { error } = await supabase
        .from("saved_listings")
        .delete()
        .eq("id", existing.id);
      
      if (error) throw error;
      revalidatePath("/listings");
      revalidatePath(`/listing/${listingId}`);
      revalidatePath("/dashboard");
      return { success: true, action: 'removed' };
    } else {
      // Add it
      const { error } = await supabase
        .from("saved_listings")
        .insert({
          user_id: user.id,
          listing_id: listingId
        });
      
      if (error) throw error;
      revalidatePath("/listings");
      revalidatePath(`/listing/${listingId}`);
      revalidatePath("/dashboard");
      return { success: true, action: 'added' };
    }
  } catch (err: any) {
    console.error("Toggle Favorite Exception:", err);
    return { error: "Database operation failed. Please try again." };
  }
}
