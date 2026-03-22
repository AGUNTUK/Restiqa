-- Add submitted_at column to transactions table to track submission time
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
