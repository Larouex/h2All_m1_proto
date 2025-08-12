# 🎯 **PRACTICAL PROMPTS: Prepare Local Database for High-Performance Monitoring**

## **🚨 PROBLEM:** Your local email_claims table is missing monitoring fields

**Current Local Schema:**

- ✅ `error_message` - For error tracking (already present)
- ✅ `ip_address` - For request source tracking (already present)
- ✅ `user_agent` - For client analytics (already present)
- ✅ `created_at` - For time-based queries (already present)

**Missing Fields:**

- ❌ `campaign_id` - Missing (needed for campaign performance)
- ❌ `redemption_value` - Missing (needed for financial calculations)
- ❌ `status` - Missing (needed for success/failure monitoring)
- ❌ `claim_count` - Missing (needed for aggregations)
- ❌ `updated_at` - Missing (needed for change tracking)
- ❌ `email` - Missing (needed for user identification)

**TypeScript Errors:**

```
Property 'campaignId' does not exist on type 'emailClaims'
Property 'redemptionValue' does not exist on type 'emailClaims'
Property 'status' does not exist on type 'emailClaims'
```

---

## **⚡ IMMEDIATE FIX PROMPTS:**

### **1. "Add the missing monitoring columns to complement your existing schema"**

```sql
-- Add missing fields while preserving your existing columns (error_message, ip_address, user_agent, created_at):
ALTER TABLE email_claims
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS campaign_id TEXT DEFAULT 'local-campaign',
ADD COLUMN IF NOT EXISTS redemption_value DECIMAL(10,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS claim_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Update existing records using your current error_message column as a guide:
UPDATE email_claims
SET
  email = COALESCE(email, 'user-' || generate_random_uuid()::text || '@local.test'),
  campaign_id = CASE
    WHEN error_message IS NULL THEN 'successful-local-campaign'
    ELSE 'failed-local-campaign'
  END,
  redemption_value = CASE
    WHEN error_message IS NULL THEN 5.00
    ELSE 0.00
  END,
  status = CASE
    WHEN error_message IS NULL THEN 'completed'
    ELSE 'failed'
  END,
  claim_count = 1,
  updated_at = created_at
WHERE campaign_id IS NULL;
```

### **2. "Create performance indexes optimized for your existing + new columns"**

```sql
-- Leverage your existing columns (error_message, ip_address, user_agent, created_at) + new ones:

-- Success/failure analysis using your existing error_message column:
CREATE INDEX IF NOT EXISTS idx_email_claims_success_rate
ON email_claims(created_at DESC) WHERE error_message IS NULL;

CREATE INDEX IF NOT EXISTS idx_email_claims_failure_analysis
ON email_claims(created_at DESC, error_message) WHERE error_message IS NOT NULL;

-- IP tracking using your existing ip_address column:
CREATE INDEX IF NOT EXISTS idx_email_claims_ip_patterns
ON email_claims(ip_address, created_at DESC) WHERE ip_address IS NOT NULL;

-- Client analytics using your existing user_agent column:
CREATE INDEX IF NOT EXISTS idx_email_claims_user_agent_stats
ON email_claims(user_agent, created_at DESC) WHERE user_agent IS NOT NULL;

-- Performance indexes for new monitoring columns:
CREATE INDEX IF NOT EXISTS idx_email_claims_campaign_performance
ON email_claims(campaign_id, created_at DESC, status);

CREATE INDEX IF NOT EXISTS idx_email_claims_value_calculations
ON email_claims(redemption_value, status) WHERE redemption_value > 0;

```

### **3. "Generate realistic test data that leverages your existing columns"**

```sql
-- Create test data using your existing schema + new monitoring fields:
INSERT INTO email_claims (
  id,
  email,
  claim_count,
  campaign_id,
  redemption_value,
  status,
  error_message,  -- Your existing column
  ip_address,     -- Your existing column
  user_agent,     -- Your existing column
  created_at,     -- Your existing column
  updated_at
)
SELECT
  'local-test-' || generate_series,
  'testuser' || generate_series || '@localdev.test',
  CASE WHEN random() < 0.8 THEN 1 ELSE 2 END,
  CASE
    WHEN generate_series % 4 = 0 THEN 'welcome-campaign'
    WHEN generate_series % 4 = 1 THEN 'monthly-special'
    WHEN generate_series % 4 = 2 THEN 'weekend-boost'
    ELSE 'loyalty-reward'
  END,
  CASE
    WHEN generate_series % 4 = 0 THEN 5.00
    WHEN generate_series % 4 = 1 THEN 10.00
    WHEN generate_series % 4 = 2 THEN 15.00
    ELSE 25.00
  END,
  CASE WHEN random() < 0.95 THEN 'completed' ELSE 'failed' END,
  -- Use your existing error_message column effectively:
  CASE
    WHEN random() < 0.95 THEN NULL
    WHEN random() < 0.98 THEN 'Rate limit exceeded'
    ELSE 'Invalid email format'
  END,
  -- Use your existing ip_address column effectively:
  CASE
    WHEN random() < 0.3 THEN '192.168.' || (random() * 255)::int || '.' || (random() * 255)::int
    WHEN random() < 0.6 THEN '10.0.' || (random() * 255)::int || '.' || (random() * 255)::int
    ELSE '172.16.' || (random() * 255)::int || '.' || (random() * 255)::int
  END,
  -- Use your existing user_agent column effectively:
  CASE
    WHEN random() < 0.25 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
    WHEN random() < 0.50 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    WHEN random() < 0.75 THEN 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    ELSE 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
  END,
  NOW() - (random() * interval '30 days'),
  NOW() - (random() * interval '29 days')
```

### **4. "Test your enhanced local database with analytics specific to your columns"**

```bash
# Test basic monitoring (using your new schema):
curl -X GET "http://localhost:3500/api/high-volume-metrics?action=total_claims"

# Test error analysis (using your existing error_message column):
curl -X GET "http://localhost:3500/api/high-volume-metrics?action=error_breakdown"
# Returns: success vs failure rates based on error_message IS NULL/NOT NULL

# Test IP analytics (using your existing ip_address column):
curl -X GET "http://localhost:3500/api/high-volume-metrics?action=ip_patterns"
# Returns: Geographic distribution and potential fraud patterns

# Test client analytics (using your existing user_agent column):
curl -X GET "http://localhost:3500/api/high-volume-metrics?action=client_analysis"
# Returns: Mobile vs Desktop vs Browser distribution

# Test campaign performance (using your new campaign_id column):
curl -X GET "http://localhost:3500/api/high-volume-metrics?action=campaign_performance"
# Returns: ROI and success rates by campaign

# Test time-based patterns (using your existing created_at column):
curl -X GET "http://localhost:3500/api/high-volume-metrics?action=hourly_trends"
# Returns: Peak hours and traffic patterns

# Test performance under load:
curl -X POST "http://localhost:3500/api/high-volume-metrics" \
  -H "Content-Type: application/json" \
  -d '{"action":"performance_test","recordCount":10000}'
```

# Test with cache warming:

curl -X POST "http://localhost:3000/api/high-volume-metrics" \
 -H "Content-Type: application/json" \
 -d '{"action":"warm_cache"}'

````

---

## **🎮 QUICK LOCAL SETUP COMMANDS:**

### **Method 1: Manual SQL (Fastest)**

```sql
-- Connect to your local PostgreSQL and run:
\c your_local_database

ALTER TABLE email_claims
ADD COLUMN IF NOT EXISTS campaign_id TEXT,
ADD COLUMN IF NOT EXISTS redemption_value DECIMAL(10,2) DEFAULT 1.00;

UPDATE email_claims SET campaign_id = 'local-test', redemption_value = 1.00
WHERE campaign_id IS NULL;

-- Create indexes:
CREATE INDEX idx_email_claims_date_status ON email_claims(created_at DESC, status);
CREATE INDEX idx_email_claims_claim_count ON email_claims(claim_count) WHERE claim_count > 0;
````

### **Method 2: Via API (Once TypeScript is fixed)**

```bash
# This will work after schema update:
curl -X POST "http://localhost:3000/api/local-setup" \
  -H "Content-Type: application/json" \
  -d '{"action":"full_setup"}'
```

---

## **🔧 FILE UPDATES NEEDED:**

### **1. Update `lib/schema.ts` (DONE)**

✅ Already updated with `campaignId` and `redemptionValue` fields

### **2. Fix TypeScript compilation:**

```bash
cd /Users/larrywjordanjr/Projects/h2all_m1_monitor
npx tsc --noEmit
# Should pass after database schema update
```

### **3. Test monitoring endpoints:**

```bash
# Test basic metrics:
curl "http://localhost:3000/api/monitor/metrics" | jq '.'

# Test high-volume metrics:
curl "http://localhost:3000/api/high-volume-metrics?action=metrics" | jq '.'
```

---

## **🚀 FRIDAY PREPARATION PROMPTS:**

### **"Simulate 10K records for Friday traffic testing"**

```sql
-- Generate test data that mimics Friday surge:
INSERT INTO email_claims (id, email, claim_count, campaign_id, redemption_value, status, created_at, updated_at)
SELECT
  'friday-' || generate_series(1, 10000),
  'user' || generate_series(1, 10000) || '@friday.com',
  1,
  'friday-campaign',
  5.00,
  'completed',
  NOW() - (random() * interval '1 hour'),
  NOW();
```

### **"Test performance with realistic data volumes"**

```bash
# After adding 10K records, test query performance:
curl -X POST "http://localhost:3000/api/high-volume-metrics" \
  -H "Content-Type: application/json" \
  -d '{"action":"performance_test"}' | jq '.data.performance.queryTime'

# Should be under 500ms with proper indexes
```

---

## **📊 EXPECTED RESULTS:**

### **After Setup:**

- ✅ TypeScript compilation passes
- ✅ All monitoring APIs work locally
- ✅ Query performance under 500ms
- ✅ Cache system functional
- ✅ Ready for Friday traffic simulation

### **Performance Targets:**

- **Small data (< 1K records):** < 100ms
- **Medium data (1K-5K records):** < 300ms
- **High volume (10K+ records):** < 500ms
- **Cache hits:** < 50ms

---

## **🎯 IMMEDIATE ACTION:**

**Run this SQL on your local database NOW:**

```sql
ALTER TABLE email_claims
ADD COLUMN IF NOT EXISTS campaign_id TEXT DEFAULT 'local-test',
ADD COLUMN IF NOT EXISTS redemption_value DECIMAL(10,2) DEFAULT 1.00;

CREATE INDEX IF NOT EXISTS idx_email_claims_date_status
ON email_claims(created_at DESC, status);
```

**Then test:**

```bash
npx tsc --noEmit  # Should pass
curl "http://localhost:3000/api/high-volume-metrics?action=metrics" | jq '.'
```

**Your local database will then match production monitoring capabilities! 🚀**
