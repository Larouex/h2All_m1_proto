-- Production Database Migration Script
-- Run this on your production database to add missing monitoring columns

-- Add missing monitoring columns to email_claims table
ALTER TABLE email_claims 
ADD COLUMN IF NOT EXISTS campaign_id TEXT DEFAULT 'production-campaign',
ADD COLUMN IF NOT EXISTS redemption_value DECIMAL(10,2) DEFAULT 5.00;

-- Update existing records with reasonable defaults
UPDATE email_claims 
SET 
  campaign_id = COALESCE(campaign_id, 'legacy-campaign'),
  redemption_value = COALESCE(redemption_value, 5.00)
WHERE campaign_id IS NULL OR redemption_value IS NULL;

-- Create performance indexes for monitoring queries
CREATE INDEX IF NOT EXISTS idx_email_claims_campaign_performance 
ON email_claims(campaign_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_claims_value_tracking 
ON email_claims(redemption_value, created_at DESC) 
WHERE redemption_value > 0;

CREATE INDEX IF NOT EXISTS idx_email_claims_email_lookup 
ON email_claims(email, created_at DESC);

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'email_claims' 
  AND column_name IN ('campaign_id', 'redemption_value')
ORDER BY ordinal_position;

-- Show sample data after migration
SELECT 
  id, 
  email, 
  claim_count, 
  campaign_id, 
  redemption_value, 
  created_at 
FROM email_claims 
LIMIT 5;
