-- Migration: Host Applications and Manual Listing Approval
-- Created: 2026-03-28

-- 1. Create Host Applications Table
CREATE TABLE IF NOT EXISTS public.host_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_message TEXT,
    full_name TEXT,
    phone TEXT,
    experience TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;

-- Policies for host_applications
DROP POLICY IF EXISTS "Users can view their own applications" ON public.host_applications;
CREATE POLICY "Users can view their own applications" ON public.host_applications
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own applications" ON public.host_applications;
CREATE POLICY "Users can insert their own applications" ON public.host_applications
FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to applications" ON public.host_applications;
CREATE POLICY "Admins have full access to applications" ON public.host_applications
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 2. Update Listings Status Default
-- Change existing listings default status to pending for new entries
ALTER TABLE public.listings ALTER COLUMN status SET DEFAULT 'pending';

-- 3. RLS Policies for Listings (Modified to allow guests to create during application)
-- Note: Currently owners can only insert if role is host. We need to allow it for guests too if it's their first listing.
-- However, we can also just keep it such that 'createListing' action is responsible for the flow.
-- Let's update the RLS policy for listings insert.

DROP POLICY IF EXISTS "Hosts can insert their own listings" ON public.listings;
CREATE POLICY "Hosts can insert their own listings" ON public.listings
FOR INSERT WITH CHECK (
    auth.uid() = host_id
    -- Removed role check here to allow guests to create a pending listing for their application.
    -- The server side logic will ensure they stay pending.
);

-- Ensure listings with status 'pending' are not visible to the public or other guests.
DROP POLICY IF EXISTS "Guests can view approved listings" ON public.listings;
CREATE POLICY "Guests can view approved listings" ON public.listings
FOR SELECT USING (
    status = 'approved' OR 
    host_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
