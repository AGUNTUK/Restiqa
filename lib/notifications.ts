import { createClient } from "./supabase/server";

export type NotificationType = "success" | "error" | "info" | "warning";

/**
 * Dispatches an internal robust notification to a target user's dashboard bell.
 */
export async function createNotification(userId: string, title: string, message: string, type: NotificationType = "info", link?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    link
  });

  if (error) {
    console.error("Failed to generate in-app notification:", error.message);
  }
}
