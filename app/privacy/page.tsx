import { getDictionary } from "@/lib/i18n";

export default async function PrivacyPage() {
  const dict = await getDictionary();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
      <div className="neo-card p-8 lg:p-12 rounded-[32px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1a202c] tracking-tight mb-4">
          {dict.footer.privacy}
        </h1>
        <p className="text-[#718096] font-medium leading-relaxed">
          Last updated: March 27, 2026
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">1. Introduction</h2>
          <p className="text-[#4a5568] leading-relaxed">
            Restiqa ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website and mobile application.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">2. Information We Collect</h2>
          <p className="text-[#4a5568] leading-relaxed">
            We collect information you provide directly to us, such as when you create an account, make a booking, or contact support. This may include your name, email address, phone number, and payment information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-[#4a5568] space-y-2">
            <li>To facilitate bookings and payments.</li>
            <li>To communicate with you about your account and bookings.</li>
            <li>To improve and personalize our services.</li>
            <li>To ensure the safety and security of our users and platform.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">4. Sharing of Information</h2>
          <p className="text-[#4a5568] leading-relaxed">
            We share your information with Hosts when you make a booking, and with service providers who perform services on our behalf. We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">5. Cookies and Similar Technologies</h2>
          <p className="text-[#4a5568] leading-relaxed">
            We use cookies to enhance your experience, analyze usage, and for marketing purposes. You can control cookie settings through your browser.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1a202c]">6. Your Choices</h2>
          <p className="text-[#4a5568] leading-relaxed">
            You can access and update your account information at any time. You may also request deletion of your account and personal data by contacting us.
          </p>
        </section>

        <section className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#d32f2f]/10 flex items-center justify-center text-[#d32f2f]">
               🛡️
             </div>
             <p className="text-sm font-bold text-[#718096]">Secure & Encrypted Data</p>
          </div>
          <p className="text-sm text-[#a0aec0]">questions@restiqa.com</p>
        </section>
      </div>
    </div>
  );
}
