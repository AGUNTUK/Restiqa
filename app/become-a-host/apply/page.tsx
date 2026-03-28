import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import HostRegistrationForm from "./HostRegistrationForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Host Registration | Restiqa",
  description: "Apply to become a host on Restiqa.",
};

export default async function HostApplyPage() {
  const dict = await getDictionary();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/become-a-host/apply");
  }

  // Check if already a host
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role === "host" || profile?.role === "admin") {
    redirect("/host");
  }

  return (
    <div className="min-h-screen bg-[#f0f3f8] py-12 lg:py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto mb-10 text-center animate-in fade-in duration-700">
        <h1 className="text-4xl md:text-5xl font-black text-[#1a202c] mb-4 tracking-tight">Host Registration</h1>
        <p className="text-[#718096] text-lg font-medium">Follow the steps below to apply for your host account and list your first property.</p>
      </div>
      
      <HostRegistrationForm />
      
      <div className="max-w-4xl mx-auto mt-12 text-center text-[#a0aec0] text-sm font-bold uppercase tracking-widest">
        Need help? Contact our support team @ restiqa.com
      </div>
    </div>
  );
}
