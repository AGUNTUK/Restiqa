-- Add duration column to listings table for Tours
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Comment for clarity
COMMENT ON COLUMN public.listings.duration IS 'Duration of the tour/stay in days. Primarily used for Tours category.';
