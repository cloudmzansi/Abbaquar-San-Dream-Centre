-- Create donations table for PayFast ITN processing
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payfast_payment_id TEXT UNIQUE NOT NULL,
  merchant_payment_id TEXT,
  payment_status TEXT NOT NULL,
  amount_gross DECIMAL(10,2) NOT NULL,
  amount_fee DECIMAL(10,2) NOT NULL,
  amount_net DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  donor_first_name TEXT,
  donor_last_name TEXT,
  donor_email TEXT,
  item_name TEXT,
  item_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_donations_payfast_payment_id ON donations(payfast_payment_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policies for donations table
-- Allow authenticated users to read all donations (for admin dashboard)
CREATE POLICY "Allow authenticated users to read donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to insert donations (for ITN callbacks)
CREATE POLICY "Allow anonymous users to insert donations"
  ON donations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to update donations
CREATE POLICY "Allow authenticated users to update donations"
  ON donations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_donations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_donations_updated_at(); 