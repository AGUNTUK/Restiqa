"use client";

import { useState } from "react";
import { updatePlatformSettings } from "@/app/actions/settings";
import { PlatformSettings } from "@/lib/settings";

export default function SettingsForm({ initialSettings }: { initialSettings: PlatformSettings }) {
  const [commission, setCommission] = useState(initialSettings.commission_rate * 100);
  const [manualPayments, setManualPayments] = useState(initialSettings.manual_payments_enabled);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("commission_rate", commission.toString());
    if (manualPayments) {
      formData.append("manual_payments_enabled", "on");
    }

    const { success, error } = await updatePlatformSettings(formData);

    setIsPending(false);
    if (success) {
      setMessage({ type: 'success', text: "Platform configurations updated instantly!" });
    } else {
      setMessage({ type: 'error', text: error || "Failed to update settings" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="neo-card p-8 md:p-12 rounded-[40px] max-w-2xl mx-auto space-y-10 relative overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-gradient-to-br from-[#8a84ff] to-[#f6d365] opacity-5 blur-3xl pointer-events-none"></div>

      {message && (
        <div className={`p-5 rounded-2xl text-sm font-extrabold flex items-center gap-3 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-[#43e97b]/10 text-[#28a745] border border-[#43e97b]/30' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          <span className="text-xl">{message.type === 'success' ? '✅' : '⚠️'}</span>
          {message.text}
        </div>
      )}

      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="pr-4">
            <h3 className="text-[#1a202c] font-black text-2xl tracking-tight">Commission Rate</h3>
            <p className="text-[#718096] text-sm mt-2 leading-relaxed">The percentage tax the platform automatically extracts from every successful booking payout.</p>
          </div>
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d32f2f] to-[#8a84ff] bg-gray-50 px-4 py-2 rounded-2xl neo-inset shadow-inner min-w-[5rem] text-center">
            {commission}%
          </span>
        </div>
        
        <input 
          type="range" 
          min="1" 
          max="30" 
          step="1"
          value={commission}
          onChange={(e) => setCommission(Number(e.target.value))}
          className="w-full h-4 bg-gray-200 rounded-xl appearance-none cursor-ew-resize accent-[#8a84ff] hover:h-5 transition-all outline-none"
        />
        <div className="flex justify-between text-xs font-black text-[#a0aec0] mt-3 uppercase tracking-widest">
          <span>1% Minimum</span>
          <span>30% Maximum</span>
        </div>
      </div>

      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8 opacity-50"></div>

      <div className="flex items-center justify-between gap-6">
        <div>
          <h3 className="text-[#1a202c] font-black text-2xl tracking-tight">Manual Payment Gateway</h3>
          <p className="text-[#718096] text-sm mt-2 leading-relaxed">Allow guests to submit physical bank transfers necessitating admin manual verifications.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer scale-125 origin-right">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={manualPayments}
            onChange={(e) => setManualPayments(e.target.checked)}
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#43e97b] peer-checked:to-[#38f9d7]"></div>
        </label>
      </div>

      <div className="pt-8">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-[#1a202c] text-white font-black text-lg py-5 rounded-2xl hover:bg-[#2d3748] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex justify-center items-center shadow-xl hover:shadow-2xl"
        >
          {isPending ? "Syncing Configuration..." : "Save Platform Configuration"}
        </button>
      </div>
    </form>
  );
}
