# H2All Monitoring Web App - Setup Instructions

## Project Overview

Create a real-time monitoring dashboard for the H2All redemption system to track:

- **Redeem Flow**: Campaign validation, code redemption, user balance updates
- **API Health**: Endpoint performance, error rates, response times
- **Database**: Connection status, query performance, data integrity

## Production System URLs

### Redeem Flow Endpoints

- **Claim Page**: https://redeeem.h2all.com/claim
- **Email Claim Page**: https://redeeem.h2all.com/emailclaim
- **Tracking Page**: https://redeeem.h2all.com/track

### API Base URL

- **Main API**: https://h2all-ux-and-api-service-production.up.railway.app

### Admin Interface

- **Admin Dashboard**: https://h2all-ux-and-api-service-production.up.railway.app/admin

## Architecture Requirements

### Tech Stack

- **Frontend**: Next.js 15 with TypeScript (matching main app)
- **Database**: PostgreSQL (shared with main app)
- **Styling**: Bootstrap 5 + React Bootstrap (consistency)
- **Real-time**: Server-Sent Events (SSE) or WebSockets
- **Deployment**: Railway (same platform as main app)

### Project Structure

```
h2all-monitor/
├── app/
│   ├── api/
│   │   ├── monitor/
│   │   │   ├── health/route.ts          # System health checks
│   │   │   ├── redeem-flow/route.ts     # Redemption monitoring
│   │   │   ├── database/route.ts        # DB performance metrics
│   │   │   └── events/route.ts          # SSE event stream
│   │   └── health/route.ts              # Basic health endpoint
│   ├── dashboard/
│   │   ├── page.tsx                     # Main monitoring dashboard
│   │   ├── components/
│   │   │   ├── RedeemFlowMonitor.tsx
│   │   │   ├── ApiHealthMonitor.tsx
│   │   │   ├── DatabaseMonitor.tsx
│   │   │   └── MetricsChart.tsx
│   │   └── layout.tsx
│   └── layout.tsx
├── lib/
│   ├── monitoring/
│   │   ├── metrics-collector.ts
│   │   ├── database-monitor.ts
│   │   └── redeem-flow-tracker.ts
│   └── db.ts                            # Shared database connection
├── components/
│   └── ui/                              # Reusable UI components
└── types/
    └── monitoring.ts                    # TypeScript interfaces
```

## Core Monitoring Components

### 1. Redeem Flow Monitor (`RedeemFlowMonitor.tsx`)

**Key Metrics to Track:**

- Total redemptions today/week/month
- Success vs failure rates
- Average redemption time
- Campaign performance breakdown
- Recent redemption activity (live feed)
- Code validation failures
- Balance update confirmations

**Data Sources:**

- `email_claims` table (total claims)
- `redemption_codes` table (code usage)
- `campaigns` table (campaign stats)
- `users` table (balance updates)

**Implementation:**

```typescript
interface RedeemFlowMetrics {
  totalRedemptions: number;
  successRate: number;
  averageRedemptionTime: number;
  recentActivity: RedemptionEvent[];
  campaignBreakdown: CampaignStats[];
  failureReasons: FailureStats[];
}

// Monitor these production redeem flow URLs:
const REDEEM_FLOW_URLS = [
  "https://redeeem.h2all.com/claim",
  "https://redeeem.h2all.com/emailclaim",
  "https://redeeem.h2all.com/track",
];

// Monitor these API endpoints:
const API_BASE = "https://h2all-ux-and-api-service-production.up.railway.app";
const API_ENDPOINTS = [
  `${API_BASE}/api/campaigns/validate`,
  `${API_BASE}/api/campaigns/redeem`,
  `${API_BASE}/api/redemption-codes`,
  `${API_BASE}/api/total-redeems`,
];
```

### 2. API Health Monitor (`ApiHealthMonitor.tsx`)

**Endpoints to Monitor:**

```typescript
const PRODUCTION_BASE_URL =
  "https://h2all-ux-and-api-service-production.up.railway.app";

const CRITICAL_ENDPOINTS = [
  `${PRODUCTION_BASE_URL}/api/health`,
  `${PRODUCTION_BASE_URL}/api/campaigns`,
  `${PRODUCTION_BASE_URL}/api/campaigns/validate`,
  `${PRODUCTION_BASE_URL}/api/campaigns/redeem`,
  `${PRODUCTION_BASE_URL}/api/redemption-codes`,
  `${PRODUCTION_BASE_URL}/api/total-redeems`,
  `${PRODUCTION_BASE_URL}/api/user/impact`,
  `${PRODUCTION_BASE_URL}/api/admin/stats`,
  `${PRODUCTION_BASE_URL}/api/admin/email-claims`,
];

const REDEEM_FLOW_ENDPOINTS = [
  "https://redeeem.h2all.com/claim",
  "https://redeeem.h2all.com/emailclaim",
  "https://redeeem.h2all.com/track",
];

const ADMIN_ENDPOINTS = [
  `${PRODUCTION_BASE_URL}/admin`,
  `${PRODUCTION_BASE_URL}/admin/email-claims`,
  `${PRODUCTION_BASE_URL}/admin/test-redemption-flow`,
];
```

**Metrics:**

- Response times (p50, p95, p99)
- Status code distribution
- Error rates by endpoint
- Uptime percentage
- Database connection health
- Memory/CPU usage (if available)

### 3. Database Monitor (`DatabaseMonitor.tsx`)

**Queries to Monitor:**

```sql
-- Connection status
SELECT COUNT(*) as active_connections FROM pg_stat_activity;

-- Table sizes and row counts
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables;

-- Slow queries (if logging enabled)
SELECT query, mean_time, calls FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;

-- Lock conflicts
SELECT COUNT(*) FROM pg_locks WHERE NOT granted;
```

**Key Tables to Monitor:**

- `email_claims` (growth rate, recent activity)
- `redemption_codes` (usage patterns, unused codes)
- `campaigns` (active campaigns, redemption stats)
- `users` (new registrations, balance changes)

## Implementation Steps

### Step 1: Environment Setup

```bash
# Create new Next.js project
npx create-next-app@latest h2all-monitor --typescript --tailwind --app

# Install dependencies
npm install react-bootstrap bootstrap drizzle-orm pg @types/pg

# Copy database configuration from main app
cp ../H2All_m1_proto/db/schema.ts ./lib/
cp ../H2All_m1_proto/db/index.ts ./lib/
```

### Step 2: Database Connection

```typescript
// lib/db.ts - Shared connection to main H2All database
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

// Import schemas from main app
export * from "./schema";
```

### Step 3: Metrics Collection API

```typescript
// app/api/monitor/health/route.ts
export async function GET() {
  try {
    // Test database connection
    const dbHealth = await testDatabaseConnection();

    // Check critical endpoints
    const apiHealth = await checkCriticalEndpoints();

    // Return comprehensive health status
    return NextResponse.json({
      status: dbHealth && apiHealth ? "healthy" : "degraded",
      database: dbHealth,
      api: apiHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

### Step 4: Real-time Dashboard

```typescript
// app/dashboard/page.tsx
"use client";

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MonitoringMetrics>();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Connect to SSE for real-time updates
  useEffect(() => {
    const eventSource = new EventSource("/api/monitor/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateMetrics(data);
      checkForAlerts(data);
    };

    return () => eventSource.close();
  }, []);

  return (
    <Container fluid className="p-4">
      <Row>
        <Col md={4}>
          <RedeemFlowMonitor metrics={metrics?.redeemFlow} />
        </Col>
        <Col md={4}>
          <ApiHealthMonitor metrics={metrics?.apiHealth} />
        </Col>
        <Col md={4}>
          <DatabaseMonitor metrics={metrics?.database} />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <AlertsPanel alerts={alerts} />
        </Col>
      </Row>
    </Container>
  );
}
```

### Step 5: Alert System

```typescript
// lib/monitoring/alerts.ts
interface AlertRule {
  name: string;
  condition: (metrics: Metrics) => boolean;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

const ALERT_RULES: AlertRule[] = [
  {
    name: "High Error Rate",
    condition: (m) => m.apiHealth.errorRate > 0.05, // 5%
    severity: "high",
    message: "API error rate exceeded 5%",
  },
  {
    name: "Database Connection Issues",
    condition: (m) => !m.database.connected,
    severity: "critical",
    message: "Database connection lost",
  },
  {
    name: "Redemption Flow Degraded",
    condition: (m) => m.redeemFlow.successRate < 0.9, // 90%
    severity: "medium",
    message: "Redemption success rate below 90%",
  },
];
```

## Data Collection Strategy

### 1. Polling Approach (Simple)

```typescript
// Collect metrics every 30 seconds
setInterval(async () => {
  const metrics = await collectAllMetrics();
  broadcastToClients(metrics);
}, 30000);
```

### 2. Event-Driven (Advanced)

```typescript
// Monitor database changes using triggers or change streams
// React to API errors in real-time
// Track redemption events as they happen
```

### 3. Hybrid Approach (Recommended)

- Real-time events for critical actions (redemptions, errors)
- Polling for aggregate metrics (every 30-60 seconds)
- Historical data collection (every 5 minutes)

## Key Performance Indicators (KPIs)

### Business Metrics

- **Total Redemptions**: Daily/weekly/monthly counts
- **Redemption Value**: Total dollar amount redeemed
- **User Growth**: New registrations over time
- **Campaign Performance**: Success rates by campaign
- **Geographic Distribution**: Redemptions by location

### Technical Metrics

- **API Availability**: Uptime percentage (target: 99.9%)
- **Response Time**: Average API response time (target: <200ms)
- **Error Rate**: API error percentage (target: <1%)
- **Database Performance**: Query execution time
- **Connection Health**: Active database connections

### Operational Metrics

- **Code Utilization**: Percentage of codes redeemed
- **Failed Validations**: Reasons for redemption failures
- **System Load**: Resource usage patterns
- **Data Growth**: Database size and growth rate

## Integration with Main App

### 1. Shared Database Access

```typescript
// Use read-only database user for monitoring
const MONITOR_DB_URL =
  process.env.MONITOR_DATABASE_URL || process.env.DATABASE_URL;
```

### 2. API Monitoring Middleware

```typescript
// Add to main app for request tracking
export function monitoringMiddleware(req: NextRequest) {
  const startTime = Date.now();

  // Track request
  console.log(`[MONITOR] ${req.method} ${req.url} started`);

  return {
    onFinish: (response: NextResponse) => {
      const duration = Date.now() - startTime;

      // Send metrics to monitoring app
      sendMetrics({
        endpoint: req.url,
        method: req.method,
        status: response.status,
        duration,
        timestamp: new Date().toISOString(),
      });
    },
  };
}
```

### 3. Event Broadcasting

```typescript
// lib/monitoring/events.ts
export async function broadcastEvent(eventType: string, data: any) {
  // Send to monitoring dashboard via webhook or SSE
  await fetch(`${MONITOR_APP_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: eventType, data, timestamp: new Date() }),
  });
}

// Use in main app redemption flow
await broadcastEvent("redemption_success", {
  userId: user.id,
  campaignId: campaign.id,
  amount: redemptionValue,
});
```

## Security Considerations

### 1. Access Control

- Admin-only access to monitoring dashboard
- API key authentication for monitoring endpoints
- Read-only database permissions

### 2. Data Privacy

- No PII in monitoring logs
- Aggregate metrics only
- Encrypted connections

### 3. Rate Limiting

- Limit monitoring API calls
- Prevent monitoring system from overwhelming main app

## Deployment

### 1. Railway Configuration

```yaml
# railway.yml
build:
  builder: NIXPACKS
variables:
  NODE_ENV: production
  DATABASE_URL: ${{ shared.DATABASE_URL }}
  MONITOR_SECRET: ${{ secrets.MONITOR_SECRET }}
```

### 2. Environment Variables

```env
DATABASE_URL=postgresql://...          # Shared with main app
MAIN_APP_URL=https://h2all-ux-and-api-service-production.up.railway.app
REDEEM_FLOW_BASE_URL=https://redeeem.h2all.com
MONITOR_SECRET=your-secret-key
NODE_ENV=production
```

### 3. Separate Deployment

- Deploy as separate Railway service
- Share database URL with main app
- Configure subdomain: `monitor.h2all.railway.app`

## Testing Strategy

### 1. Monitor Testing

```typescript
// Test monitoring endpoints
describe("Monitoring API", () => {
  test("health check returns status", async () => {
    const response = await fetch("/api/monitor/health");
    expect(response.status).toBe(200);
  });

  test("redeem flow metrics are collected", async () => {
    // Trigger redemption in main app
    // Verify metrics are captured
  });
});
```

### 2. Load Testing

- Simulate high redemption volume
- Monitor system performance under load
- Validate alert thresholds

## Maintenance

### 1. Log Retention

- Keep detailed logs for 7 days
- Aggregate metrics for 30 days
- Historical trends for 1 year

### 2. Alert Tuning

- Adjust thresholds based on normal patterns
- Reduce false positives
- Ensure critical alerts are reliable

### 3. Performance Optimization

- Optimize database queries
- Implement caching for metrics
- Use database indexes for monitoring queries

This monitoring system will provide comprehensive visibility into your H2All redemption system, enabling proactive issue detection and performance optimization.
