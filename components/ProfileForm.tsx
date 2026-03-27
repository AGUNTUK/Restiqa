"use client";

import { useState } from "react";
import { updateProfile, uploadAvatar } from "@/app/actions/profile";
import Image from "next/image";

type ProfileData = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  emergency_contact: string | null;
  avatar_url: string | null;
};

export default function ProfileForm({ initialData }: { initialData: ProfileData }) {
  const [data, setData] = useState(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);
    setIsUploading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.url) {
      setData(prev => ({ ...prev, avatar_url: result.url as string }));
      setMessage({ type: "success", text: "Profile picture updated!" });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    setIsUpdating(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="neo-card p-8 rounded-[32px] flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-[4px_4px_15px_rgba(211,47,47,0.25)] relative">
            {data.avatar_url ? (
              <Image 
                src={data.avatar_url} 
                alt={data.name || "User"} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#d32f2f] to-[#8bc1c1] flex items-center justify-center text-4xl font-extrabold text-white">
                {data.name?.charAt(0).toUpperCase() || data.email?.charAt(0).toUpperCase()}
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all text-xl">
            📸
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
          </label>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-extrabold text-[#1a202c]">Profile Picture</h3>
          <p className="text-sm text-[#718096] mt-2 leading-relaxed">
            Upload a clear photo to build trust with hosts and guests. <br className="hidden lg:block" />
            Max size: 2MB. JPG, PNG or WebP.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="neo-card p-8 md:p-10 rounded-[32px] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#a0aec0] ml-1">Full Name</label>
            <input 
              name="name" 
              defaultValue={data.name || ""} 
              className="w-full neo-inset rounded-2xl px-5 py-3.5 font-bold text-[#2d3748] focus:outline-none focus:ring-2 ring-[#d32f2f]/20 transition-all bg-transparent" 
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#a0aec0] ml-1">Email Address</label>
            <input 
              defaultValue={data.email || ""} 
              className="w-full neo-inset rounded-2xl px-5 py-3.5 font-bold text-[#a0aec0] bg-transparent opacity-60 cursor-not-allowed" 
              disabled
              title="Email cannot be changed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#a0aec0] ml-1">Phone Number</label>
            <input 
              name="phone" 
              defaultValue={data.phone || ""} 
              className="w-full neo-inset rounded-2xl px-5 py-3.5 font-bold text-[#2d3748] focus:outline-none focus:ring-2 ring-[#d32f2f]/20 transition-all bg-transparent" 
              placeholder="+880 1XXX-XXXXXX"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#a0aec0] ml-1">Emergency Contact</label>
            <input 
              name="emergency_contact" 
              defaultValue={data.emergency_contact || ""} 
              className="w-full neo-inset rounded-2xl px-5 py-3.5 font-bold text-[#2d3748] focus:outline-none focus:ring-2 ring-[#d32f2f]/20 transition-all bg-transparent" 
              placeholder="Name & Number"
            />
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
            {message.type === "success" ? "✅ " : "⚠️ "}{message.text}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={isUpdating}
            className="neo-btn neo-btn-primary px-8 py-4 rounded-2xl text-sm font-black tracking-widest uppercase transition-all disabled:opacity-50"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
