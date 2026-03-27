import { getDictionary } from "@/lib/i18n";

export default async function TermsPage() {
  const dict = await getDictionary();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
      <div className="neo-card p-8 lg:p-12 rounded-[32px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1a202c] tracking-tight mb-4">
          {dict.footer.terms}
        </h1>
        <p className="text-[#718096] font-medium leading-relaxed">
          Last updated: March 27, 2026
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">1. Acceptance of Terms</h2>
          <p className="text-[#4a5568] leading-relaxed">
            By accessing or using the Restiqa platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">2. Service Description</h2>
          <p className="text-[#4a5568] leading-relaxed">
            Restiqa provides an online marketplace that connects Hosts who have accommodations to rent with Guests seeking to book such accommodations. We do not own, manage, or control the properties listed on our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">3. User Responsibilities</h2>
          <p className="text-[#4a5568] leading-relaxed">
            Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. Guests must follow host rules and treat properties with respect.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">4. Booking and Payment</h2>
          <p className="text-[#4a5568] leading-relaxed">
            Bookings are confirmed once payment is verified. Restiqa currently uses a manual payment verification system (bKash/Nagad/Upay/Bank). Users must provide accurate transaction details for verification.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">5. Cancellation and Refunds</h2>
          <p className="text-[#4a5568] leading-relaxed">
            Cancellation policies are set by each Host for their specific listing. Guests should review the cancellation policy before making a booking.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">6. Limitation of Liability</h2>
          <p className="text-[#4a5568] leading-relaxed">
            Restiqa is not liable for any disputes between Guests and Hosts, or for the condition of properties. We provide the platform "as is" and make no guarantees regarding property quality or safety.
          </p>
        </section>

        <section className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#d32f2f]/10 flex items-center justify-center text-[#d32f2f]">
               📜
             </div>
             <p className="text-sm font-bold text-[#718096]">Legal Compliance</p>
          </div>
          <p className="text-sm text-[#a0aec0]">legal@restiqa.com</p>
        </section>
      </div>
    </div>
  );
}
