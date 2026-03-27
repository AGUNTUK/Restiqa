"use client";

export default function InteractiveHeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* ── Soft Ambient Nebulas ── */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] rounded-full opacity-15 mix-blend-multiply blur-[80px] sm:blur-[120px] animate-pulse-slow"
        style={{ background: "#d32f2f" }}
      />
      <div
        className="absolute top-[10%] -right-[15%] w-[55%] h-[85%] rounded-full opacity-10 mix-blend-multiply blur-[80px] sm:blur-[120px] animate-pulse-slow"
        style={{ background: "#8bc1c1", animationDelay: "2s" }}
      />
      <div
        className="absolute -bottom-[20%] left-[20%] w-[40%] h-[60%] rounded-full opacity-10 mix-blend-multiply blur-[70px] sm:blur-[100px] animate-pulse-slow"
        style={{ background: "#43e97b", animationDelay: "1s" }}
      />
    </div>
  );
}
