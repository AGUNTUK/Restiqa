-- Create listing_views table
CREATE TABLE IF NOT EXISTS public.listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional if guest
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    ip_hash TEXT -- Minor privacy-preserving analytics
);

-- Enable RLS
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public can insert (record a view)
CREATE POLICY "Anyone can record a view" ON public.listing_views FOR INSERT WITH CHECK (true);

-- 2. Hosts can read views for THEIR listings
CREATE POLICY "Hosts can view analytics for their listings" ON public.listing_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE listings.id = listing_views.listing_id
            AND listings.host_id = auth.uid()
        )
    );

-- 3. Admins can see everything
CREATE POLICY "Admins have master access to views" ON public.listing_views
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Indexes for performance
CREATE INDEX idx_listing_views_listing_id ON public.listing_views(listing_id);
CREATE INDEX idx_listing_views_viewed_at ON public.listing_views(viewed_at);
