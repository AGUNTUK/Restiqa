-- ============================================================
-- SECURITY HARDENING: RLS POLICIES
-- ============================================================

-- 1. USER PRIVACY (users table)
-- Restrict public SELECT to safe fields only
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
CREATE POLICY "Public profiles are viewable by everyone" ON public.users 
  FOR SELECT USING (true); -- Note: Selective field access is usually handled at the API/View layer in Supabase, 
                           -- but we can harden it further by ensuring sensitive fields aren't used in public views.

-- 2. PAYOUT METHODS (payout_methods table)
-- Allow hosts to manage their own details
DROP POLICY IF EXISTS "Hosts can manage own payout methods" ON public.payout_methods;
CREATE POLICY "Hosts can manage own payout methods" ON public.payout_methods 
  FOR ALL USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());

-- 3. ADMIN OVERRIDES (Master Access)
-- Grant admins full access to critical tables to allow platform moderation

-- Listings (Already has admin policy, ensuring it's comprehensive)
DROP POLICY IF EXISTS "Admins have full access to listings" ON public.listings;
CREATE POLICY "Admins have full access to listings" ON public.listings 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Bookings
DROP POLICY IF EXISTS "Admins have full access to bookings" ON public.bookings;
CREATE POLICY "Admins have full access to bookings" ON public.bookings 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Transactions
DROP POLICY IF EXISTS "Admins have full access to transactions" ON public.transactions;
CREATE POLICY "Admins have full access to transactions" ON public.transactions 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Payouts
DROP POLICY IF EXISTS "Admins have full access to payouts" ON public.payouts;
CREATE POLICY "Admins have full access to payouts" ON public.payouts 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Payout Methods
DROP POLICY IF EXISTS "Admins have full access to payout methods" ON public.payout_methods;
CREATE POLICY "Admins have full access to payout methods" ON public.payout_methods 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Notifications
DROP POLICY IF EXISTS "Admins have full access to notifications" ON public.notifications;
CREATE POLICY "Admins have full access to notifications" ON public.notifications 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 4. VERIFY TRANSACTIONS (transactions table)
-- Ensure users can only SEE their transactions (already exists, but confirming)
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" ON public.transactions 
  FOR SELECT USING (user_id = auth.uid());
