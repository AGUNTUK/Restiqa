"use server";

import { createClient } from "@/lib/supabase/server";

export async function markNotificationsRead(notificationIds: string[]) {
  if (!notificationIds || notificationIds.length === 0) return;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", notificationIds)
    .eq("user_id", user.id); // Security boundary: ensure user strictly owns targets
}
