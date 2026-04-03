"use client";

interface Category {
  id: string;
  label: string;
}

const CATEGORIES: Category[] = [
  { id: "all", label: "All Stories" },
  { id: "Guides", label: "Travel Guides" },
  { id: "Adventure", label: "Adventure" },
  { id: "Food", label: "Food & Dining" },
  { id: "Culture", label: "Culture & Art" },
];

interface BlogCategoryBarProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function BlogCategoryBar({ activeCategory, onCategoryChange }: BlogCategoryBarProps) {
  return (
    <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
            activeCategory === cat.id
              ? "bg-[#d32f2f] text-white shadow-lg scale-105"
              : "bg-white/80 text-[#718096] hover:bg-white hover:text-[#d32f2f] neo-shadow-sm border border-white/20"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
