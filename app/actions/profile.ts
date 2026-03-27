"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const emergency_contact = formData.get("emergency_contact") as string;

  const { error } = await supabase
    .from("users")
    .update({
      name,
      phone,
      emergency_contact,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error.message);
    return { error: "Failed to update profile details." };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return { error: "No file provided" };

  // 1. Upload to Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("profiles")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    });

  if (uploadError) {
    console.error("Avatar upload error:", uploadError.message);
    return { error: "Failed to upload image." };
  }

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from("profiles")
    .getPublicUrl(fileName);

  // 3. Update Database
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return { error: "Failed to update profile picture in database." };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { success: true, url: publicUrl };
}
