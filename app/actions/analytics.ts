"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackListingView(listingId: string) {
  try {
    const supabase = await createClient();
    
    // We don't necessarily need the user ID for basic analytics, 
    // but we'll record it if they are logged in.
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("listing_views")
      .insert({
        listing_id: listingId,
        viewer_id: user?.id || null,
      });

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error tracking view:", error);
    return { success: false };
  }
}
