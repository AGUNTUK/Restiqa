CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Enforce singleton
  commission_rate NUMERIC NOT NULL DEFAULT 0.10,
  manual_payments_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial values
INSERT INTO platform_settings (id, commission_rate, manual_payments_enabled) 
VALUES (1, 0.10, true)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Admin update access" ON platform_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
