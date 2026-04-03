"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setCompletion(
          Number((currentProgress / scrollHeight).toFixed(2)) * 100
        );
      }
    };

    window.addEventListener("scroll", updateScrollCompletion);
    return () => {
      window.removeEventListener("scroll", updateScrollCompletion);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[100] pointer-events-none">
      <div 
        className="h-full bg-[#d32f2f] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(211,47,47,0.5)]"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
}
