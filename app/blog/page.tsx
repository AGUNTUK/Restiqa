import type { Metadata } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { type Blog } from "@/lib/types/database";
import BlogListClient from "@/components/BlogListClient";

export const metadata: Metadata = {
  title: "Travel Guides & Insider Tips | Restiqa Stays",
  description: "Explore the best destinations in Bangladesh. Expert travel tips, local seafood guides, and hidden waterfalls in Cox's Bazar, Sylhet, and Bandarban.",
};

export default async function BlogListingPage() {
  let blogs: Blog[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select(`
        *,
        users ( name, avatar_url )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      blogs = data.map((b: any) => ({
        ...b,
        author_name: b.users?.name,
        author_avatar: b.users?.avatar_url,
      }));
    }
  }

  return (
    <div className="bg-[#f7fafc] min-h-screen">
      <BlogListClient initialBlogs={blogs} />
    </div>
  );
}
