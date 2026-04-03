"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Blog } from "@/lib/types/database";
import BlogCategoryBar from "@/components/BlogCategoryBar";

interface BlogListClientProps {
  initialBlogs: Blog[];
}

export default function BlogListClient({ initialBlogs }: BlogListClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredBlogs = useMemo(() => {
    if (activeCategory === "all") return initialBlogs;
    return initialBlogs.filter((b) => b.category === activeCategory);
  }, [activeCategory, initialBlogs]);

  const featuredPost = initialBlogs[0];
  const regularPosts = filteredBlogs.filter(p => p.id !== (activeCategory === 'all' ? featuredPost?.id : null));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
      {/* 1. Page Title */}
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter" style={{ color: "#1a202c" }}>
          Travel <span className="text-[#d32f2f]">Insights</span>
        </h1>
        <p className="text-lg md:text-xl text-[#718096] font-medium leading-relaxed">
          Expert guides, local secrets, and the best places to stay across beautiful Bangladesh. 
          Your journey starts here.
        </p>
      </div>

      {/* 2. Featured Post (Only on 'All') */}
      {activeCategory === "all" && featuredPost && (
        <div className="mb-20">
          <Link href={`/blog/${featuredPost.slug}`} className="group no-underline">
            <div className="neo-card rounded-[48px] overflow-hidden p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center transition-all duration-500 hover:shadow-2xl">
              <div className="relative aspect-[16/10] lg:aspect-square rounded-[36px] overflow-hidden">
                <Image
                  src={featuredPost.cover_image || "https://images.unsplash.com/photo-1544333323-537ffecaa8c3?w=1200"}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-[#d32f2f] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-widest">
                    Featured
                  </span>
                </div>
              </div>
              
              <div className="px-4 lg:px-8 space-y-6">
                <div className="flex items-center gap-3">
                   <span className="text-[#d32f2f] font-extrabold text-sm uppercase tracking-widest">{featuredPost.category || 'Guides'}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e0]"></span>
                   <span className="text-[#a0aec0] font-bold text-sm tracking-wide">
                     {new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                   </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-[#1a202c] leading-tight group-hover:text-[#d32f2f] transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-[#718096] text-lg font-medium leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-[#e2e8f0]">
                   <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <Image 
                        src={featuredPost.author_avatar || "https://i.pravatar.cc/100"} 
                        alt={featuredPost.author_name || "Author"} 
                        width={40} height={40} className="object-cover"
                      />
                   </div>
                   <span className="font-bold text-[#4a5568]">{featuredPost.author_name || "Restiqa Team"}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 3. Category Filter */}
      <BlogCategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* 4. Grid System */}
      {regularPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {regularPosts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="group no-underline block"
            >
              <div className="neo-card rounded-[40px] overflow-hidden p-3.5 h-full flex flex-col transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl">
                <div className="relative aspect-[16/11] rounded-[32px] overflow-hidden mb-6">
                  <Image
                    src={post.cover_image || "https://images.unsplash.com/photo-1544333323-537ffecaa8c3?w=800"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                     <span className="bg-white/90 backdrop-blur-md text-[#2a6b78] px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm border border-white/50">
                        {post.category || 'Guides'}
                     </span>
                  </div>
                </div>
                
                <div className="px-4 flex flex-col flex-grow">
                  <h2 className="text-2xl font-extrabold mb-4 line-clamp-2 transition-colors group-hover:text-[#d32f2f]" style={{ color: "#1a202c" }}>
                    {post.title}
                  </h2>
                  <p className="text-[#718096] text-sm font-medium line-clamp-3 mb-8 leading-relaxed opacity-80">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-[#e2e8f0] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden neo-shadow-sm border-2 border-white">
                        <Image
                          src={post.author_avatar || "https://i.pravatar.cc/100"}
                          alt={post.author_name || "Author"}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-[#4a5568]">{post.author_name || "Restiqa Team"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 neo-card rounded-[48px] max-w-xl mx-auto border border-dashed border-[#e2e8f0]">
          <span className="text-4xl mb-4 block">🏝️</span>
          <p className="text-xl font-bold text-[#a0aec0]">No stories found in this category yet. Explore other destinations above!</p>
        </div>
      )}
    </div>
  );
}
