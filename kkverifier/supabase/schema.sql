-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT NOT NULL UNIQUE,
  recipient_address TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  certificate_type TEXT NOT NULL,
  issuer_name TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  ipfs_hash TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_certificate_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_recipient_address ON certificates(recipient_address);
CREATE INDEX IF NOT EXISTS idx_tx_hash ON certificates(tx_hash);

-- Enable Row Level Security (RLS)
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON certificates
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated insert
CREATE POLICY "Allow authenticated insert" ON certificates
  FOR INSERT
  WITH CHECK (true);
