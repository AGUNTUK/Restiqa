-- Relax listing constraints to allow 0 beds/baths for Tours
-- This is necessary because tours often don't have dedicated beds or baths.

-- 1. Drop old constraints
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_beds_check;
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_baths_check;

-- 2. Add new constraints allowing 0
ALTER TABLE public.listings ADD CONSTRAINT listings_beds_check CHECK (beds >= 0);
ALTER TABLE public.listings ADD CONSTRAINT listings_baths_check CHECK (baths >= 0);

-- 3. Also update default values to 0 if needed (optional, keeping as 1/1 for properties)
-- ALTER TABLE public.listings ALTER COLUMN beds SET DEFAULT 0;
-- ALTER TABLE public.listings ALTER COLUMN baths SET DEFAULT 0;
