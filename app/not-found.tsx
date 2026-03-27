import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="neo-card max-w-lg w-full p-10 md:p-16 rounded-[40px] text-center relative overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-[#d32f2f]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-[#8bc1c1]/5 rounded-full blur-3xl"></div>

        <div className="mb-8 relative inline-block">
          <span className="text-9xl font-black text-[#e2e8f0]/40 tracking-tighter">404</span>
          <div className="absolute inset-0 flex items-center justify-center pt-8">
             <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl neo-inset border border-white/40">
                🔦
             </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a202c] mb-4 tracking-tight">
          Oops! You've drifted too far.
        </h1>
        <p className="text-[#718096] font-medium text-lg mb-10 max-w-sm mx-auto leading-relaxed">
          The page you're looking for was either moved or never existed. Let's get you back to safety.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/listings" 
            className="neo-btn-primary px-8 py-4 rounded-2xl font-extrabold text-sm tracking-wide shadow-lg hover:translate-y-[-2px] transition-all"
          >
            Browse Listings
          </Link>
          <Link 
            href="/" 
            className="px-8 py-4 rounded-2xl font-extrabold text-sm text-[#1a202c] border-2 border-transparent hover:border-[#1a202c]/10 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
