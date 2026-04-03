"use client";

import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";

export default function AdGeneratorPage() {
  const adRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Ad Copy State - So you can dynamically edit the ad!
  const [headline, setHeadline] = useState("আপনার প্রপার্টি কি আপনার জন্য ইনকাম করছে?");
  const [subHeadline, setSubHeadline] = useState("Restiqa-তে হোস্ট হয়ে আজই শুরু করুন আপনার উপার্জনের নতুন যাত্রা।");
  const [badgeText, setBadgeText] = useState("০% কমিশন");
  const [buttonText, setButtonText] = useState("Sign Up Now");

  const handleDownload = async () => {
    if (!adRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(adRef.current, {
        scale: 2, // High resolution
        useCORS: true, // Allow external images
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `restiqa_ad_${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating ad:", error);
      alert("Failed to generate ad. Please check the console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row items-center justify-center p-6 gap-10">
      {/* ── DESIGN PREVIEW PANEL ── */}
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold text-gray-800">Ad Preview (1080x1080)</h2>
        
        {/* Ad Container (FB/Insta Square) */}
        <div
          ref={adRef}
          style={{ width: "1080px", height: "1080px", transform: "scale(0.5)", transformOrigin: "top" }}
          className="relative bg-white shadow-2xl rounded-sm overflow-hidden"
        >
          {/* Background Image (Luxury Apartment) */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80')",
            }}
          />

          {/* Gradient Overlay for Readability */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: "linear-gradient(90deg, rgba(26,32,44,0.9) 0%, rgba(26,32,44,0.6) 40%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Ad Content */}
          <div className="absolute inset-0 z-20 flex flex-col justify-between p-20">
            
            {/* Top Bar: Logo & Badge */}
            <div className="flex justify-between items-start">
              {/* Fake Logo since SVG might not render from next/image in html2canvas without proper setup */}
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #d32f2f, #8bc1c1)",
                  }}
                >
                  <span className="text-white">R</span>
                </div>
                <h1 className="text-5xl font-extrabold text-white tracking-tight">Restiqa</h1>
              </div>

              {/* Promo Badge */}
              <div
                className="px-8 py-4 rounded-full font-bold text-3xl shadow-2xl backdrop-blur-md border border-white/20"
                style={{
                  background: "rgba(211, 47, 47, 0.9)", // Crimson Red #d32f2f
                  color: "#fff",
                }}
              >
                🔥 {badgeText}
              </div>
            </div>

            {/* Typography Section (Bengali looks great here) */}
            <div className="max-w-[700px] mt-20">
              <h2
                className="text-[5.5rem] leading-[1.1] font-bold text-white mb-10 drop-shadow-lg"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }} // Using google fonts if installed globally, or fallback
              >
                {headline}
              </h2>
              
              <p
                className="text-4xl text-[#8bc1c1] leading-relaxed font-medium mb-16 pl-6 border-l-8 border-[#d32f2f]"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                {subHeadline}
              </p>

              {/* Call to Action Box */}
              <div className="inline-block p-1 bg-gradient-to-r from-[#d32f2f] to-[#8bc1c1] rounded-2xl shadow-2xl">
                <div className="bg-gray-900 px-12 py-6 rounded-2xl flex items-center gap-6">
                  <span className="text-4xl font-bold text-white uppercase tracking-wider">
                    {buttonText}
                  </span>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 text-3xl">
                    →
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer or Trust Badges (Optional) */}
            <div className="mt-auto">
              <p className="text-white/60 text-2xl font-medium tracking-widest uppercase">
                WWW.RESTIQA.COM/BECOME-A-HOST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTROL PANEL ── */}
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl z-10 lg:-ml-20">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Restiqa Ad Creator</h2>
        <p className="text-gray-500 mb-8">Edit the text below and download perfectly formatted high-res ads with proper Bengali typography!</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Headline (Bengali)</label>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d32f2f] focus:outline-none text-lg"
              rows={3}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Sub-Headline (Bengali)</label>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d32f2f] focus:outline-none"
              rows={2}
              value={subHeadline}
              onChange={(e) => setSubHeadline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Badge Text</label>
              <input
                type="text"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d32f2f] focus:outline-none"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d32f2f] focus:outline-none"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full mt-6 py-4 font-bold rounded-xl text-white transition-all transform active:scale-95 disabled:opacity-50 text-lg flex justify-center items-center gap-3 shadow-lg"
            style={{ background: "#d32f2f" }}
          >
            {isGenerating ? (
              <span>Generating HQ PNG... ⏳</span>
            ) : (
              <span>Download Ad 📸</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
