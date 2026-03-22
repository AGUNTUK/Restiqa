-- Add gateway_transaction_id and sender_number to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS sender_number TEXT;
