import Link from "next/link";
import { type dictionaries } from "@/lib/i18n/dictionaries";
import Logo from "./Logo";

export default function Footer({ dict, locale }: { dict: typeof dictionaries["en"]; locale: string }) {
  const footerLinksArr = [
    {
      heading: dict.footer.explore,
      links: [
        { href: "/listings", label: dict.footer.browseListings },
        { href: "/listings?type=villa", label: dict.footer.villas },
        { href: "/listings?type=apartment", label: dict.footer.apartments },
      ],
    },
    {
      heading: dict.footer.company,
      links: [
        { href: "#", label: dict.footer.aboutUs },
        { href: "#", label: dict.footer.careers },
        { href: "/blog", label: dict.footer.blog },
      ],
    },
    {
      heading: dict.common.popularDest,
      links: [
        { href: "/listings?city=dhaka", label: dict.search.cities.dhaka },
        { href: "/listings?city=coxsBazar", label: dict.search.cities.coxsBazar },
        { href: "/listings?city=sylhet", label: dict.search.cities.sylhet },
        { href: "/listings?city=sajek", label: dict.search.cities.sajek },
      ],
    },
    {
      heading: dict.footer.support,
      links: [
        { href: "#", label: dict.footer.helpCenter },
        { href: "/privacy", label: dict.footer.privacy },
        { href: "/terms", label: dict.footer.terms },
      ],
    },
  ];

  return (
    <footer className="relative mt-auto pt-16 pb-8 overflow-hidden" style={{ background: "#e0e5ec" }}>
      {/* Decorative Blob */}
      <div className="absolute -bottom-24 -left-20 w-96 h-96 rounded-full bg-[#d32f2f] opacity-5 blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          
          {/* Brand Identity */}
          <div className="lg:col-span-2">
            <div className="mb-6 inline-block">
              <Logo width={180} height={60} />
            </div>
            <p className="text-[#718096] text-sm leading-relaxed mb-8 max-w-xs font-medium">
              {dict.footer.about}
            </p>
            <div className="flex gap-4">
              {["𝕏", "f", "in", "📸"].map((icon) => (
                <button
                  key={icon}
                  className="w-10 h-10 rounded-xl bg-[#e0e5ec] shadow-[4px_4px_10px_#c4c9ce,-4px_-4px_10px_#ffffff] hover:shadow-inner flex items-center justify-center text-[#d32f2f] transition-all hover:scale-105 active:scale-95 group"
                >
                  <span className="text-sm font-black group-hover:scale-110 transition-transform">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Link Verticals */}
          {footerLinksArr.map(({ heading, links }) => (
            <div key={heading} className="space-y-6">
              <h3 className="text-[#1a202c] font-black text-[10px] uppercase tracking-[0.15em] opacity-60">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[#4a5568] text-sm font-bold no-underline hover:text-[#d32f2f] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="w-full h-[1px] bg-white/40 shadow-sm mb-8"></div>

        {/* Global Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#a0aec0] text-xs font-black tracking-widest uppercase italic bg-white/30 px-4 py-2 rounded-full shadow-inner" suppressHydrationWarning>
            © {new Date().getFullYear()} Restiqa Marketplace. {dict.footer.rights}
          </p>
          
          <div className="flex items-center gap-4 text-[10px] font-black text-[#a0aec0] uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#43e97b] animate-pulse"></span> App Status: Operational</span>
            <span className="w-[1px] h-3 bg-gray-300"></span>
            <span>Version 2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
