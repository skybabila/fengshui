-- Heartbeat table for cron job database activity tracking
CREATE TABLE IF NOT EXISTS heartbeat (
  id TEXT PRIMARY KEY,
  last_ping TIMESTAMP WITH TIME ZONE,
  random_value INTEGER,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE heartbeat ENABLE ROW LEVEL SECURITY;

-- Policy for admin access
CREATE POLICY "Admin can manage heartbeat" ON heartbeat
  FOR ALL
  USING (is_admin());

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_heartbeat_updated_at
  BEFORE UPDATE ON heartbeat
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();