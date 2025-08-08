# API Organization Pattern in H2All

## 🏗️ ARCHITECTURAL DESIGN

### 1. `/api/admin/*` - Administrative Functions

- **Purpose**: Operations that require admin privileges
- **Security**: All endpoints check `tokenPayload.isAdmin === true`
- **Access Control**: Restricted to users with admin role
- **Functions**:
  - User management (create, update, delete users)
  - System administration (data export, cleanup, stats)
  - Content management (manage campaigns, codes, projects)

### 2. `/api/user/*` - User-Scoped Operations

- **Purpose**: User-specific data and operations
- **Security**: Users can only access their own data (or admins can access any)
- **Access Control**: `tokenPayload.userId === requestedUserId || tokenPayload.isAdmin`
- **Functions**: Personal impact data, profile operations

### 3. `/api/auth/*` - Authentication System

- **Purpose**: Login, logout, registration, session management
- **Security**: Mix of public (login/register) and authenticated (me/logout) endpoints
- **Access Control**: Varies by endpoint

### 4. Root `/api/*` - General Application APIs

- **Purpose**: Core business logic accessible to authenticated users
- **Security**: Usually requires authentication but not admin privileges
- **Mixed Access**: Some operations require admin (POST/PUT/DELETE), others are public (GET)

## 🔐 SECURITY PATTERN

### Admin-Only Operations (`/api/admin/*`)

```typescript
// ALL admin APIs follow this pattern:
const tokenPayload = await verifyToken(authToken);
if (!tokenPayload || !tokenPayload.isAdmin) {
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}
```

### User-Scoped Operations (`/api/user/*`)

```typescript
// User APIs allow access to own data + admin override:
if (tokenPayload.userId !== userId && !tokenPayload.isAdmin) {
  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}
```

### Mixed Access (Root `/api/*`)

```typescript
// Example: Campaigns - GET is public, POST/PUT/DELETE require admin
if (method === "POST" || method === "PUT" || method === "DELETE") {
  if (!tokenPayload || !tokenPayload.isAdmin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }
}
```

## 📊 BREAKDOWN BY CATEGORY

| Path Pattern   | Auth Level         | Purpose               | Examples                            |
| -------------- | ------------------ | --------------------- | ----------------------------------- |
| `/api/admin/*` | **Admin Required** | System administration | User management, stats, data export |
| `/api/user/*`  | **User + Admin**   | Personal data access  | Impact data, user profiles          |
| `/api/auth/*`  | **Mixed**          | Authentication system | Login, register, logout             |
| `/api/*`       | **Mixed**          | Core business logic   | Campaigns (read), redemption        |

## 🎯 WHY THIS ORGANIZATION?

1. **Security Clarity**: Clear separation of privilege levels
2. **Route Protection**: Easy to identify which endpoints need admin rights
3. **Scalability**: New admin features go under `/admin`, user features under `/user`
4. **Maintenance**: Easy to find and audit admin-only functionality
5. **Compliance**: Clear audit trail for administrative actions

## 📋 COMPLETE API INVENTORY

### AUTHENTICATION APIS ✅

- `POST /api/auth/login`
- `POST /api/auth/logout` + GET/PUT/PATCH/DELETE (blocked)
- `GET /api/auth/me`
- `POST /api/auth/register`

### USER MANAGEMENT APIS ✅

- `GET /api/admin/users` - List users
- `PUT /api/admin/users` - Update user
- `DELETE /api/admin/users` - Delete user
- `POST /api/admin/manage-user` - Change admin status
- `POST /api/admin/promote-user` - Promote to admin
- `GET /api/admin/data/users` - Export users CSV

### USER PROFILE APIS ✅

- `GET /api/user/impact` + POST/PUT/DELETE (blocked)
- `GET /api/user/email-impact`
- `GET /api/user/impact/seed` + POST/PUT/DELETE (blocked)

### CAMPAIGN APIS ✅

- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign (Admin)
- `PUT /api/campaigns` - Update campaign (Admin)
- `DELETE /api/campaigns` - Delete campaign (Admin)
- `GET /api/campaigns/[id]` - Get specific campaign
- `PUT /api/campaigns/[id]` - Update specific campaign (Admin)
- `DELETE /api/campaigns/[id]` - Delete specific campaign (Admin)
- `POST /api/campaigns/redeem` + GET/PUT/PATCH/DELETE (blocked)
- `GET /api/campaigns/seed` + POST/PUT/DELETE (blocked)
- `GET /api/campaigns/validate`

### REDEMPTION CODE APIS ✅

- `GET /api/redemption-codes`
- `POST /api/redemption-codes` (Admin)

### ADMIN UTILITY APIS ✅

- `POST /api/admin/generate-redeem-url`
- `GET /api/admin/generate-redeem-url`
- `GET /api/admin/data/campaigns` + POST
- `GET /api/admin/stats`
- `GET /api/admin/campaigns-list`
- `GET /api/admin/unused-codes`

### EMAIL CLAIMS APIS ❌ _[Missing from Documentation]_

- `GET /api/admin/email-claims`
- `DELETE /api/admin/email-claims`
- `PUT /api/admin/email-claims`
- `GET /api/admin/emailclaims` _(duplicate?)_
- `POST /api/emailclaim`
- `GET /api/emailclaim`
- `POST /api/admin/migrate-email-claims`

### PROJECTS APIS ❌ _[Missing from Documentation]_

- `GET /api/admin/projects`
- `DELETE /api/admin/projects`
- `PUT /api/admin/projects`
- `POST /api/projects` + GET/PUT/PATCH/DELETE (blocked)

### SUBSCRIPTIONS APIS ❌ _[Missing from Documentation]_

- `GET /api/admin/subscriptions`
- `DELETE /api/admin/subscriptions`
- `PUT /api/admin/subscriptions`
- `POST /api/subscribe`

### DATA MANAGEMENT APIS ❌ _[Missing from Documentation]_

- `GET /api/admin/data/backup-info`
- `POST /api/admin/data/clean` - **DANGEROUS DELETE ALL**
- `GET /api/admin/data/codes` + POST
- `POST /api/admin/data/users` (blocked for security)

### DEBUG & HEALTH APIS ❌ _[Missing from Documentation]_

- `POST /api/debug/create-test-project` + GET
- `GET /api/debug/database`
- `GET /api/health`

### UTILITY & TEST APIS ✅

- `GET /api/test-redemption-parser` + POST
- `GET /api/test-cookies`
- `GET /api/test`
- `GET /api/test-codes`
- `GET /api/test-url-parser` + POST

### SWAGGER API ✅

- `GET /api/swagger`

## 🚨 CRITICAL MISSING DOCUMENTATION

**Email Claims System** - 7 endpoints completely undocumented  
**Projects Management** - 4 endpoints missing  
**Subscriptions** - 4 endpoints missing  
**Data Management** - 4 endpoints missing  
**Debug/Health** - 3 endpoints missing

**Total Missing**: Approximately **22+ endpoints** including entire functional areas.

---

The `/api/admin` structure is a **security-first design pattern** that makes it immediately clear which operations require elevated privileges and helps prevent accidental exposure of administrative functions.
