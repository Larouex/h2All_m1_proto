-- Production Performance Indexes for H2All Email Claims
-- Execute these on Railway PostgreSQL database for optimal performance

-- Critical: Email lookup index (primary performance bottleneck)
CREATE INDEX IF NOT EXISTS idx_email_claims_email ON email_claims(email);

-- Analytics: Date-based queries
CREATE INDEX IF NOT EXISTS idx_email_claims_created_at ON email_claims(created_at);

-- Performance: Composite index for frequent queries
CREATE INDEX IF NOT EXISTS idx_email_claims_email_updated ON email_claims(email, updated_at);

-- Show table indexes
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'email_claims' 
ORDER BY indexname;
