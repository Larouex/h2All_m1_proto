# H2All M1 Proto API Monitoring Prompts

## Configuration

- **Domain**: `h2allm1monitor-production.up.railway.app`
- **Base URL**: `https://h2allm1monitor-production.up.railway.app`
- **Security**: All endpoints now secured with three-tier authentication

## Authentication Requirements

- **PUBLIC**: Origin validation only
- **PROTECTED**: Requires `x-api-key: ${NEXT_PUBLIC_API_KEY}`
- **ADMIN**: Requires `x-api-key: ${API_KEY}`

---

## 1. HEALTH & STATUS ENDPOINTS (PUBLIC)

### Health Check

```
Monitor endpoint: GET /api/health
Expected: 200 OK with service status
Description: Primary health check for Railway deployment
Security Level: PUBLIC (origin validation only)
```

### Alternative Health Checks

```
Monitor endpoint: GET /health
Expected: 200 OK
Description: Alternative health endpoint
Security Level: PUBLIC
```

```
Monitor endpoint: GET /healthz
Expected: 200 OK
Description: Kubernetes-style health check
Security Level: PUBLIC
```

---

## 2. AUTHENTICATION ENDPOINTS (PUBLIC/PROTECTED)

### User Registration

```
Monitor endpoint: POST /api/auth/register
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Body: {"email": "monitor@test.com", "password": "password123", "firstName": "Monitor", "lastName": "Test"}
Expected: 201 Created
Security Level: PROTECTED
```

### User Login

```
Monitor endpoint: POST /api/auth/login
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Body: {"email": "monitor@test.com", "password": "password123"}
Expected: 200 OK with auth token
Security Level: PROTECTED
```

### User Profile

```
Monitor endpoint: GET /api/auth/me
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}, Cookie: auth-token=${TOKEN}
Expected: 200 OK with user data
Security Level: PROTECTED
```

### User Logout

```
Monitor endpoint: POST /api/auth/logout
Expected: 200 OK
Security Level: PUBLIC (intentionally unsecured)
```

---

## 3. EMAIL & SUBSCRIPTION ENDPOINTS (PROTECTED)

### Email Claim Status

```
Monitor endpoint: GET /api/emailclaim?email=monitor@test.com
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Expected: 200 OK with claim status
Security Level: PROTECTED
```

### Email Claim Processing

```
Monitor endpoint: POST /api/emailclaim
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Body: {"email": "monitor@test.com", "campaign_id": "kodema-village", "redemption_value": 0.05}
Expected: 200 OK
Security Level: PROTECTED
```

### Newsletter Subscription

```
Monitor endpoint: POST /api/subscribe
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Body: {"email": "monitor@test.com", "preferences": {"marketing": true, "updates": true}}
Expected: 200 OK
Security Level: PROTECTED
```

---

## 4. CAMPAIGN ENDPOINTS (PUBLIC/PROTECTED/ADMIN)

### List Campaigns

```
Monitor endpoint: GET /api/campaigns
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Expected: 200 OK with campaigns array
Security Level: PROTECTED
```

### Get Specific Campaign

```
Monitor endpoint: GET /api/campaigns/kodema-village
Expected: 200 OK with campaign details
Security Level: PUBLIC
```

### Create Sample Campaign Data

```
Monitor endpoint: GET /api/campaigns/seed
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with sample campaign
Security Level: ADMIN
```

### Validate Campaign Code

```
Monitor endpoint: POST /api/campaigns/validate
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Body: {"code": "SAMPLE-CODE-123"}
Expected: 200/400 depending on code validity
Security Level: PROTECTED
```

### Redeem Campaign Code

```
Monitor endpoint: POST /api/campaigns/redeem
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Body: {"code": "SAMPLE-CODE-123", "email": "monitor@test.com"}
Expected: 200/400 depending on code
Security Level: PROTECTED
```

### Update Campaign (Admin)

```
Monitor endpoint: PUT /api/campaigns/kodema-village
Headers: x-api-key: ${API_KEY}
Body: {"name": "Updated Campaign Name"}
Expected: 200 OK
Security Level: ADMIN
```

### Delete Campaign (Admin)

```
Monitor endpoint: DELETE /api/campaigns/kodema-village
Headers: x-api-key: ${API_KEY}
Expected: 200 OK
Security Level: ADMIN
```

---

## 5. REDEMPTION & CODE ENDPOINTS (PROTECTED/ADMIN)

### List Redemption Codes

```
Monitor endpoint: GET /api/redemption-codes
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Expected: 200 OK with codes array
Security Level: PROTECTED
```

### Create Redemption Codes

```
Monitor endpoint: POST /api/redemption-codes
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Body: {"count": 5, "campaign_id": "kodema-village", "value": 0.05}
Expected: 201 Created
Security Level: PROTECTED
```

### Get Total Redemption Stats

```
Monitor endpoint: GET /api/total-redeems
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Expected: 200 OK with stats
Security Level: PROTECTED
```

---

## 6. PROJECT & IMPACT ENDPOINTS (PROTECTED/ADMIN)

### List Projects

```
Monitor endpoint: GET /api/projects
Expected: 200 OK with projects array
Security Level: PUBLIC
```

### Create Project

```
Monitor endpoint: POST /api/projects
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Body: {"name": "Monitor Test Project", "description": "Test project for monitoring"}
Expected: 201 Created
Security Level: PROTECTED
```

### Get User Impact Data

```
Monitor endpoint: GET /api/user/impact
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}, Cookie: auth-token=${TOKEN}
Expected: 200 OK with impact data
Security Level: PROTECTED
```

### Get Email-based Impact

```
Monitor endpoint: GET /api/user/email-impact?email=monitor@test.com
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Expected: 200 OK with impact data
Security Level: PROTECTED
```

### Seed User Impact Data

```
Monitor endpoint: GET /api/user/impact/seed
Headers: x-api-key: ${API_KEY}
Expected: 200 OK
Security Level: ADMIN
```

---

## 7. ADMIN DATA MANAGEMENT ENDPOINTS (ADMIN)

### Admin Stats Dashboard

```
Monitor endpoint: GET /api/admin/stats
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with comprehensive stats
Security Level: ADMIN
```

### Export Campaigns Data

```
Monitor endpoint: GET /api/admin/data/campaigns
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with CSV data
Security Level: ADMIN
```

### Import Campaigns Data

```
Monitor endpoint: POST /api/admin/data/campaigns
Headers: x-api-key: ${API_KEY}
Body: CSV campaign data
Expected: 200 OK
Security Level: ADMIN
```

### Database Cleanup

```
Monitor endpoint: POST /api/admin/data/clean
Headers: x-api-key: ${API_KEY}
Body: {"confirm": true}
Expected: 200 OK with cleanup results
Security Level: ADMIN
```

### Database Backup Info

```
Monitor endpoint: GET /api/admin/data/backup-info
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with backup status
Security Level: ADMIN
```

---

## 8. ADMIN USER MANAGEMENT ENDPOINTS (ADMIN)

### List All Users

```
Monitor endpoint: GET /api/admin/users?page=1&limit=50
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with users list
Security Level: ADMIN
```

### Promote User to Admin

```
Monitor endpoint: POST /api/admin/promote-user
Headers: x-api-key: ${API_KEY}
Body: {"email": "user@example.com"}
Expected: 200 OK
Security Level: ADMIN
```

### Manage User Admin Status

```
Monitor endpoint: POST /api/admin/manage-user
Headers: x-api-key: ${API_KEY}
Body: {"email": "user@example.com", "isAdmin": false}
Expected: 200 OK
Security Level: ADMIN
```

---

## 9. ADMIN EMAIL CLAIMS ENDPOINTS (ADMIN)

### Get Email Claims Data

```
Monitor endpoint: GET /api/admin/emailclaims
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with email claims
Security Level: ADMIN
```

### Diagnose Email Claims

```
Monitor endpoint: GET /api/admin/diagnose-email-claims
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with diagnostic info
Security Level: ADMIN
```

### Fix Email Timestamps

```
Monitor endpoint: POST /api/admin/fix-email-timestamps
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with fix results
Security Level: ADMIN
```

### Migrate Email Claims

```
Monitor endpoint: POST /api/admin/migrate-email-claims
Headers: x-api-key: ${API_KEY}
Expected: 200 OK
Security Level: ADMIN
```

---

## 10. ADMIN UTILITY ENDPOINTS (ADMIN)

### Generate Redeem URL

```
Monitor endpoint: GET /api/admin/generate-redeem-url
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with instructions
Security Level: ADMIN
```

```
Monitor endpoint: POST /api/admin/generate-redeem-url
Headers: x-api-key: ${API_KEY}
Body: {"campaignId": "kodema-village", "count": 1}
Expected: 200 OK with generated URLs
Security Level: ADMIN
```

### List Unused Codes

```
Monitor endpoint: GET /api/admin/unused-codes
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with unused codes
Security Level: ADMIN
```

### List Campaigns (Admin View)

```
Monitor endpoint: GET /api/admin/campaigns-list
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with admin campaign view
Security Level: ADMIN
```

### Admin Projects Management

```
Monitor endpoint: GET /api/admin/projects?page=1
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with projects management view
Security Level: ADMIN
```

### Admin Subscriptions Management

```
Monitor endpoint: GET /api/admin/subscriptions?page=1
Headers: x-api-key: ${API_KEY}
Expected: 200 OK with subscriptions management
Security Level: ADMIN
```

---

## 11. TEST & DEVELOPMENT ENDPOINTS (PROTECTED)

### Test API Functionality

```
Monitor endpoint: GET /api/test
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Expected: 200 OK with test response
Security Level: PROTECTED
```

```
Monitor endpoint: POST /api/test
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Body: {"test": "data"}
Expected: 200 OK
Security Level: PROTECTED
```

---

## 12. DOCUMENTATION ENDPOINTS (PUBLIC)

### API Documentation

```
Monitor endpoint: GET /api/swagger
Expected: 200 OK with OpenAPI spec
Security Level: PUBLIC (intentionally unsecured)
```

---

## SECURITY VERIFICATION TESTS

### Test Unauthorized Access (Should Fail)

```
Monitor endpoint: GET /api/admin/stats
Headers: (no x-api-key)
Expected: 401 Unauthorized
Description: Verify admin endpoints reject requests without API key
```

```
Monitor endpoint: GET /api/campaigns
Headers: (no x-api-key)
Expected: 401 Unauthorized
Description: Verify protected endpoints reject requests without API key
```

### Test Wrong API Key (Should Fail)

```
Monitor endpoint: GET /api/admin/stats
Headers: x-api-key: wrong-key
Expected: 401 Unauthorized
Description: Verify admin endpoints reject wrong API key
```

### Test Protected Key on Admin Endpoint (Should Fail)

```
Monitor endpoint: GET /api/admin/stats
Headers: x-api-key: ${NEXT_PUBLIC_API_KEY}
Expected: 401 Unauthorized
Description: Verify admin endpoints reject protected-level API key
```

---

## MONITORING SCHEDULE RECOMMENDATIONS

### High Priority (Every 5 minutes)

- Health checks (/api/health, /health, /healthz)
- Authentication flow (register, login, logout)
- Email claim processing
- Campaign listing

### Medium Priority (Every 15 minutes)

- User impact data
- Redemption statistics
- Project listings
- Newsletter subscriptions

### Low Priority (Every hour)

- Admin stats dashboard
- Database cleanup status
- Security verification tests

### Daily Checks

- Full admin functionality audit
- Complete API coverage test
- Performance benchmarks

---

## ERROR MONITORING

### Expected Error Responses

- **401 Unauthorized**: Missing or invalid API key
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **405 Method Not Allowed**: HTTP method not supported
- **500 Internal Server Error**: Server-side issues

### Alert Conditions

- Any 5xx errors
- Authentication failures exceeding threshold
- Response times > 5 seconds
- Health check failures
- Security verification test failures

---

## ENVIRONMENT VARIABLES REQUIRED

```bash
# These should be set in the monitoring application
NEXT_PUBLIC_API_KEY=your_protected_api_key_here
API_KEY=your_admin_api_key_here
ALLOWED_ORIGINS=h2allm1monitor-production.up.railway.app,localhost:3000
```

---

## NOTES

1. **All endpoints are now secured** except `/api/swagger` and `/api/auth/logout`
2. **Three-tier security**: PUBLIC → PROTECTED → ADMIN
3. **Origin validation** applied to all requests
4. **Proper authentication** required for all sensitive operations
5. **Production ready** with comprehensive security coverage
