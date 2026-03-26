import type { Metadata } from "next";
import { getPlatformSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = {
  title: "Admin - Settings",
  description: "Global Platform Configuration",
};

export default async function AdminSettingsPage() {
  const currentSettings = await getPlatformSettings();

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-12 text-center md:text-left pt-4">
        <h1 className="text-4xl font-black text-[#1a202c] mb-3 tracking-tight">Platform Settings</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-widest uppercase">Master Configuration Hub</p>
      </div>

      <SettingsForm initialSettings={currentSettings} />
    </div>
  );
}
