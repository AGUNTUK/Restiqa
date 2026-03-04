-- ============================================
-- EMAIL & SMS NOTIFICATIONS DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- EMAIL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at);

-- ============================================
-- SMS VERIFICATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sms_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'phone_verification',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_verifications_phone ON public.sms_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_expires ON public.sms_verifications(expires_at);

-- ============================================
-- USER PREFERENCE NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  booking_confirmations BOOLEAN DEFAULT true,
  booking_reminders BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  review_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- AI SEARCH HISTORY TABLE (for recommendations)
-- ============================================
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  search_query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  clicked_property_ids UUID[] DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON public.search_history(search_query);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON public.search_history(created_at);

-- ============================================
-- PROPERTY RECOMMENDATIONS CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recommendation_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  property_ids UUID[] NOT NULL,
  recommendation_type TEXT NOT NULL,
  score DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, recommendation_type)
);

CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user ON public.recommendation_cache(user_id);
