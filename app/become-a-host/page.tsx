import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { becomeHost } from "@/app/actions/host";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Become a Host | Restiqa",
  description: "Earn money by hosting your space on Restiqa. Join thousands of hosts in Bangladesh.",
};

export default async function BecomeAHostPage() {
  const dict = await getDictionary();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isHost = false;
  let applicationStatus: string | null = null;
  let adminMessage: string | null = null;

  if (user) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    isHost = profile?.role === "host" || profile?.role === "admin";

    if (!isHost) {
      const { data: app } = await supabase
        .from("host_applications")
        .select("status, admin_message")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (app) {
        applicationStatus = app.status;
        adminMessage = app.admin_message;
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-24">
      {/* ── Hero Section ── */}
      <section className="text-center max-w-3xl mx-auto neo-card p-8 lg:p-16 rounded-[40px] animate-in slide-in-from-bottom duration-700">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-6" style={{ color: "#1a202c", letterSpacing: "-0.03em" }}>
          {dict.becomeHost.title}
        </h1>
        <p className="text-lg text-[#718096] mb-10 font-medium leading-relaxed">
          {dict.becomeHost.subtitle}
        </p>
        {isHost ? (
          <div className="space-y-4">
            <p className="text-green-600 font-bold">You are already a Host!</p>
            <Link
              href="/host"
              className="neo-btn neo-btn-primary px-10 py-5 rounded-2xl font-extrabold text-lg inline-block transition-transform hover:-translate-y-1 active:scale-95 shadow-[0_10px_25px_-5px_rgba(211, 47, 47,0.4)]"
              style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#fff" }}
            >
              Go to Host Dashboard
            </Link>
          </div>
        ) : applicationStatus === "pending" ? (
          <div className="p-10 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-inner">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 className="text-2xl font-black text-amber-800 mb-2">Application Under Review</h3>
            <p className="text-amber-700 font-medium max-w-xs mx-auto">
              Our team is currently reviewing your registration. We'll update your status very soon!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {applicationStatus === "rejected" && (
              <div className="p-6 rounded-2xl bg-red-50 border border-red-100 mb-8 text-left">
                <p className="text-red-700 font-bold mb-1 flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                   Previous Application Rejected
                </p>
                <p className="text-red-600/80 text-sm font-medium">
                  Reason: {adminMessage || "No reason provided."}
                </p>
              </div>
            )}
            <Link
              href="/become-a-host/apply"
              className="neo-btn neo-btn-primary px-12 py-6 rounded-[24px] font-black text-xl inline-block transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(211,47,47,0.3)]"
              style={{ background: "linear-gradient(135deg, #d32f2f, #a12c2c)", color: "#fff" }}
            >
              {applicationStatus === "rejected" ? "Apply Again" : dict.becomeHost.cta}
            </Link>
          </div>
        )}
      </section>

      {/* ── Benefits Section ── */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#1a202c] mb-4">{dict.becomeHost.benefitsTitle}</h2>
          <div className="w-24 h-1 bg-[#d32f2f] mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {dict.becomeHost.benefits.map((benefit: any, i: number) => (
            <div key={i} className="neo-card p-8 rounded-[32px] text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="text-5xl mb-6 mx-auto w-20 h-20 bg-white/50 backdrop-blur-md flex items-center justify-center rounded-2xl shadow-inner">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1a202c] mb-3">{benefit.title}</h3>
              <p className="text-[#718096] leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Steps Section ── */}
      <section className="neo-inset p-8 lg:p-16 rounded-[40px]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-[#1a202c] mb-4">{dict.becomeHost.stepsTitle}</h2>
          <div className="w-24 h-1 bg-[#43e97b] mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative border-l-2 md:border-l-0 md:border-t-2 border-[#d1d9e0] border-dashed pt-8 md:pt-12 pl-8 md:pl-0">
          {dict.becomeHost.steps.map((step: any, i: number) => (
            <div key={i} className="relative mt-8 md:mt-0">
              <div className="absolute -left-12 -top-14 md:-top-20 md:left-1/2 md:-translate-x-1/2 w-10 h-10 rounded-full bg-[#d32f2f] text-white flex items-center justify-center font-extrabold text-lg shadow-[0_0_15px_rgba(211, 47, 47,0.4)]">
                {step.step}
              </div>
              <h3 className="text-xl font-bold text-[#1a202c] mb-3 md:text-center mt-2 md:mt-0">{step.title}</h3>
              <p className="text-[#718096] md:text-center leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section>
         <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#1a202c] mb-4">{dict.becomeHost.testimonialsTitle}</h2>
          <div className="w-24 h-1 bg-[#8bc1c1] mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {dict.becomeHost.testimonials.map((test: any, i: number) => (
            <div key={i} className="neo-card p-10 rounded-[32px] relative">
              <div className="absolute top-6 left-6 text-6xl text-[#d32f2f] opacity-10 font-serif">"</div>
              <p className="text-[#2a6b78] font-semibold text-lg italic mb-8 relative z-10 leading-relaxed">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d32f2f] to-[#8bc1c1] flex items-center justify-center text-white font-bold text-lg">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-[#1a202c]">{test.name}</h4>
                  <p className="text-sm text-[#718096]">Host in {test.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-12">
        {isHost ? (
          <Link
            href="/host"
            className="neo-btn neo-btn-primary px-10 py-5 rounded-2xl font-extrabold text-lg inline-block transition-transform hover:-translate-y-1 active:scale-95 shadow-[0_10px_25px_-5px_rgba(211, 47, 47,0.4)]"
            style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)", color: "#fff" }}
          >
            Go to Host Dashboard
          </Link>
        ) : (
          <form action={becomeHost}>
            <button
              type="submit"
              className="neo-btn neo-btn-primary px-10 py-5 rounded-2xl font-extrabold text-lg inline-block transition-transform hover:-translate-y-1 active:scale-95 shadow-[0_10px_25px_-5px_rgba(211, 47, 47,0.4)]"
              style={{ background: "linear-gradient(135deg, #d32f2f, #8bc1c1)", color: "#fff" }}
            >
              {dict.becomeHost.cta}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
