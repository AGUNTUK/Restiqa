-- Enforce unique gateway_transaction_id for payment transactions
-- We only apply uniqueness for non-null values (Postgres handles this by default for UNIQUE constraints)
ALTER TABLE transactions
ADD CONSTRAINT unique_gateway_transaction_id UNIQUE (gateway_transaction_id);
