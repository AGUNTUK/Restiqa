-- Create Saved Listings (Favorites) table
CREATE TABLE IF NOT EXISTS public.saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Enable RLS
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own favorites
DROP POLICY IF EXISTS "Users can view own saved listings" ON public.saved_listings;
CREATE POLICY "Users can view own saved listings" ON public.saved_listings 
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own saved listings" ON public.saved_listings;
CREATE POLICY "Users can insert own saved listings" ON public.saved_listings 
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own saved listings" ON public.saved_listings;
CREATE POLICY "Users can delete own saved listings" ON public.saved_listings 
  FOR DELETE USING (user_id = auth.uid());

-- Admins can view all (for moderation/analytics)
DROP POLICY IF EXISTS "Admins can view all saved listings" ON public.saved_listings;
CREATE POLICY "Admins have full access to saved listings" ON public.saved_listings 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
