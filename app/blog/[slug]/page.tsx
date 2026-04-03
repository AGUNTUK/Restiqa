import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient, createStaticClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { type Blog } from "@/lib/types/database";
import { getDictionary, getLocale } from "@/lib/i18n";
import ReadingProgress from "@/components/ReadingProgress";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createStaticClient();
  const { data } = await supabase.from("blogs").select("slug");

  return (data || []).map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  if (!isSupabaseConfigured()) return { title: "Blog - Restiqa" };

  const supabase = await createStaticClient();
  const { data } = await supabase
    .from("blogs")
    .select("title, excerpt, cover_image")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Blog Not Found" };

  return {
    title: `${data.title} | Restiqa Travel Blog`,
    description: data.excerpt || `Read about ${data.title} on Restiqa.`,
    keywords: [
      data.title, "bangladesh travel", "travel guide", "restiqa blog",
      "বাংলাদেশ ভ্রমণ", "ভ্রমণ গাইড", "রেস্টিকা ব্লগ", "ভ্রমণ টিপস"
    ],
    openGraph: {
      title: data.title,
      description: data.excerpt,
      images: [data.cover_image || "/og-blog.jpg"],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.excerpt,
      images: data.cover_image ? [data.cover_image] : [],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    }
  };
}

export default async function BlogDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const dict = await getDictionary();
  const locale = await getLocale();

  if (!isSupabaseConfigured()) {
    return notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(`
      *,
      users ( name, avatar_url, bio )
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const post = {
    ...data,
    author_name: data.users?.name,
    author_avatar: data.users?.avatar_url,
    author_bio: data.users?.bio,
  };

  // Simple Markdown-ish to HTML converter for the demo
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl md:text-6xl font-extrabold mb-12 mt-16 text-[#1a202c] tracking-tight">{line.substring(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl md:text-4xl font-bold mb-8 mt-14 text-[#2a6b78] tracking-tight">{line.substring(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl md:text-2xl font-bold mb-6 mt-10 text-[#2a6b78]">{line.substring(4)}</h3>;
      if (line.startsWith('* ')) return <li key={i} className="ml-6 mb-4 list-disc text-[#4a5568] text-lg leading-relaxed">{line.substring(2)}</li>;
      if (line.startsWith('[View All')) {
        const match = line.match(/\[(.*?)\]\((.*?)\)/);
        if (match) return <div key={i} className="my-12 text-center"><Link href={match[2]} className="neo-btn px-10 py-4 rounded-2xl font-extrabold inline-block no-underline text-[#d32f2f] bg-white shadow-xl hover:shadow-2xl transition-all active:scale-95 border border-[#e2e8f0]">{match[1]}</Link></div>;
      }
      if (line.includes('[') && line.includes('](')) {
        const parts = line.split(/(\[.*?\]\(.*?\))/);
        return (
          <p key={i} className="text-xl text-[#2d3748] leading-[1.8] mb-8 font-medium">
            {parts.map((p, j) => {
              const m = p.match(/\[(.*?)\]\((.*?)\)/);
              if (m) return <Link key={j} href={m[2]} className="text-[#d32f2f] font-bold hover:underline decoration-thickness-2 underline-offset-2">{m[1]}</Link>;
              return p;
            })}
          </p>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-4" />;
      return <p key={i} className="text-xl text-[#2d3748] leading-[1.8] mb-8 font-medium">{line}</p>;
    });
  };

  return (
    <div className="bg-[#f7fafc] min-h-screen">
      <ReadingProgress />
      
      <article className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* Back button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 mb-12 text-[#d32f2f] font-extrabold text-sm no-underline hover:underline group"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> {dict.blog?.backToList || "Back to Insights"}
        </Link>

        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-6">
             <span className="bg-[#d32f2f]/10 text-[#d32f2f] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-[#d32f2f]/20">
               {post.category || "Guides"}
             </span>
             <span className="text-[#a0aec0] font-bold text-sm">
                • {new Date(post.created_at).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
             </span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-extrabold mb-10 tracking-tighter leading-[1.1] text-[#1a202c]">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 py-10 border-y border-[#e2e8f0]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden neo-shadow-sm border-2 border-white shadow-lg">
                <Image
                  src={post.author_avatar || "https://i.pravatar.cc/100"}
                  alt={post.author_name || "Author"}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-extrabold text-lg text-[#1a202c]">{post.author_name || "Restiqa Editor"}</p>
                <p className="text-sm font-bold text-[#a0aec0]">Travel Specialist</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
               <span className="bg-[#f0fff4] text-[#2f855a] px-4 py-1.5 rounded-full text-xs font-bold border border-[#c6f6d5]">
                 {dict.blog?.verifiedGuide || "Verified Guide"}
               </span>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="relative aspect-[16/9] mb-16 rounded-[48px] overflow-hidden p-3 bg-white shadow-2xl">
          <div className="relative w-full h-full rounded-[40px] overflow-hidden">
            <Image
              src={post.cover_image || "https://images.unsplash.com/photo-1544333323-537ffecaa8c3?w=1200"}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-3xl mx-auto mb-24 px-2">
          {renderContent(post.content)}
        </div>

        {/* Author Bio Section */}
        <div className="max-w-3xl mx-auto neo-card rounded-[48px] p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 border border-white shadow-xl bg-white/60 backdrop-blur-md">
          <div className="w-28 h-28 rounded-[36px] overflow-hidden neo-shadow-sm flex-shrink-0 rotate-3 border-4 border-white shadow-2xl">
            <Image
              src={post.author_avatar || "https://i.pravatar.cc/150"}
              alt={post.author_name || "Author"}
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-extrabold text-2xl mb-3 text-[#1a202c]">
              {dict.blog?.aboutAuthor || "About the Author"}
            </h3>
            <p className="text-[#4a5568] leading-relaxed text-lg font-medium opacity-80">
              {post.author_bio || "Restiqa is Bangladesh's premier travel marketplace. We bring you handpicked rentals and expert travel guides to make your journey extraordinary."}
            </p>
          </div>
        </div>
        
        {/* Related Stays */}
        <FeaturedStays blogTitle={post.title} />
        
        {/* Newsletter CTA */}
        <div className="max-w-3xl mx-auto mt-24 text-center">
          <div className="neo-card p-12 md:p-20 rounded-[56px] bg-[#1a202c] text-white overflow-hidden relative shadow-2xl">
             <div className="absolute top-0 right-0 w-80 h-80 bg-[#d32f2f]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
             <div className="relative z-10">
               <span className="text-[#d32f2f] font-black text-sm uppercase tracking-[0.2em] mb-4 block">Newsletter</span>
               <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Never miss an adventure</h2>
               <p className="text-white/60 text-lg font-medium mb-12 max-w-md mx-auto">Join 5,000+ travelers receiving early-bird deals and secret guides.</p>
               <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto bg-white/5 p-3 rounded-[32px] border border-white/10 backdrop-blur-sm">
                 <input 
                   type="email" 
                   placeholder="Your email address" 
                   className="flex-grow bg-transparent border-none rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
                 />
                 <button className="bg-[#d32f2f] text-white px-10 py-4 rounded-2xl font-black hover:bg-[#b02222] transition-all hover:scale-105 active:scale-95 shadow-xl">
                   Join →
                 </button>
               </div>
             </div>
          </div>
        </div>
      </article>
      
      {/* Related Posts Section (Placeholder Logic) */}
      <RelatedPosts currentSlug={slug} />
    </div>
  );
}

async function FeaturedStays({ blogTitle }: { blogTitle: string }) {
  let listings: any[] = [];
  
  // Expanded city detection
  const cities = ["Cox's Bazar", "Dhaka", "Sylhet", "Bandarban", "Sajek", "Khulna", "Chittagong"];
  const city = cities.find(c => blogTitle.toLowerCase().includes(c.toLowerCase())) || "Cox's Bazar";

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings_with_stats")
      .select("*")
      .ilike("city", `%${city}%`)
      .eq("status", "approved")
      .limit(3);
    
    listings = data || [];
  }

  if (listings.length === 0) return null;

  const dict = await getDictionary();

  return (
    <section className="max-w-4xl mx-auto mt-24 pt-20 border-t border-[#e2e8f0]">
      <div className="flex items-center justify-between mb-12">
         <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a202c] tracking-tight">
            Explore {city}
         </h2>
         <Link href={`/listings?city=${encodeURIComponent(city)}`} className="text-[#d32f2f] font-black text-sm no-underline hover:underline">
            View all stays →
         </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {listings.map((item) => (
          <ListingCard key={item.id} listing={item} dict={dict} />
        ))}
      </div>
    </section>
  );
}

async function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  let posts: Blog[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blogs")
      .select("*, users(name, avatar_url)")
      .neq("slug", currentSlug)
      .limit(3);
    
    posts = (data || []).map((p: any) => ({
      ...p,
      author_name: p.users?.name,
      author_avatar: p.users?.avatar_url
    }));
  }

  if (posts.length === 0) return null;

  return (
    <section className="bg-white py-24 mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-black text-[#1a202c] mb-12 tracking-tighter text-center">More Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group no-underline">
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-6">
                <Image src={post.cover_image || ""} alt={post.title} fill className="object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                   <p className="text-[#d32f2f] font-black text-[10px] uppercase tracking-widest mb-1">{post.category || 'Guides'}</p>
                   <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{post.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import ListingCard from "@/components/ListingCard";
