import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden p-0 md:p-0">
        {children}
      </main>
    </div>
  );
}
