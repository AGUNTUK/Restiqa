-- Add 'tour' to listing_type enum
-- Note: In Postgres, you cannot run ALTER TYPE ... ADD VALUE inside a transaction block or DO $$ block easily.
-- This should be run as a standalone command.

ALTER TYPE public.listing_type ADD VALUE IF NOT EXISTS 'tour';
