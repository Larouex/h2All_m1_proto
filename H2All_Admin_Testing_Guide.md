# H2All Admin Interface Testing Guide

## TL;DR - Quick Start for Project Managers

**Production URL**: https://h2all-ux-and-api-service-production.up.railway.app

The H2All admin interface is a comprehensive campaign management system that allows creation, testing, and monitoring of carbon offset redemption campaigns. Key capabilities include:

✅ **Campaign Management** - Create/edit campaigns with redemption values and expiration dates  
✅ **Redemption Code Generation** - Auto-generate unique codes for campaigns  
✅ **URL Testing** - Generate and test redemption URLs before distribution  
✅ **Data Analytics** - Export/import campaign and user data via CSV  
✅ **User Management** - Monitor user accounts and redemption activity

**Quick Test**: Visit `/admin/test-redemption-urls` to generate a working redemption URL in under 2 minutes.

---

## Admin Interface Overview

### Access Requirements

- **Admin Login Required**: Use admin credentials to access `/admin` dashboard
- **Authentication**: JWT token-based authentication with persistent sessions
- **Security**: All admin endpoints require admin role verification

### Core Admin Features

#### 1. Campaign Management (`/admin/campaigns`)

**Purpose**: Create and manage carbon offset redemption campaigns

**Key Features**:

- ✅ Create new campaigns with custom redemption values ($5-$100)
- ✅ Set campaign expiration dates and maximum redemptions
- ✅ Toggle campaign active/inactive status
- ✅ Edit existing campaign details
- ✅ Delete campaigns (with confirmation)
- ✅ View campaign statistics (current vs max redemptions)

**Data Fields**:

- Campaign Name (e.g., "Clean Water Initiative 2025")
- Description (marketing copy for users)
- Redemption Value (dollar amount awarded)
- Start/End Dates
- Maximum Redemptions
- Active/Inactive Status

#### 2. Redemption Code Generator (`/admin/codes`)

**Purpose**: Generate unique redemption codes for campaigns

**Key Features**:

- ✅ Generate bulk codes (1-1000 at a time)
- ✅ Auto-generate 8-character alphanumeric codes
- ✅ Link codes to specific campaigns
- ✅ View code usage statistics
- ✅ Export codes to CSV for distribution

**Code Format**: `H2O-CLEAN-001-V2` (customizable length and pattern)

#### 3. User Management (`/admin/users`)

**Purpose**: Monitor user accounts and activity

**Key Features**:

- ✅ View all registered users
- ✅ Monitor redemption history
- ✅ Check user balances
- ✅ Promote users to admin status
- ✅ Activate/deactivate accounts
- ✅ Export user data

#### 4. Data Analytics (`/admin/data`)

**Purpose**: Data import/export and analytics

**Key Features**:

- ✅ Export campaign data to CSV
- ✅ Export redemption codes to CSV
- ✅ Export user data to CSV
- ✅ Import bulk campaign data from CSV
- ✅ Import bulk codes from CSV
- ✅ Real-time statistics dashboard

#### 5. Redemption URL Tester (`/admin/test-redemption-urls`)

**Purpose**: Generate and test redemption URLs before distribution

**Key Features**:

- ✅ Select campaign from database
- ✅ Choose unused redemption code or generate custom
- ✅ Generate working redemption URLs
- ✅ Test URLs immediately
- ✅ Copy URLs for distribution
- ✅ Track generated URL history

---

## Testing Scenarios

### Scenario 1: Create Campaign & Generate Redemption URL

**Time Required**: 3-5 minutes  
**Purpose**: End-to-end test of campaign creation to working redemption URL

**Steps**:

1. **Login**: Navigate to `/admin` and authenticate
2. **Create Campaign**:
   - Go to `/admin/campaigns`
   - Click "New Campaign"
   - Fill in: Name="Earth Day 2025", Value="$25", Expires="2025-12-31"
   - Save campaign
3. **Generate Codes**:
   - Go to `/admin/codes`
   - Select your new campaign
   - Generate 10 codes
4. **Test Redemption URL**:
   - Go to `/admin/test-redemption-urls`
   - Select your campaign
   - Choose an unused code
   - Click "Generate URL"
   - Copy and test the generated URL

**Expected Result**: Working redemption URL that displays campaign info and allows redemption

### Scenario 2: Bulk Data Operations

**Time Required**: 2-3 minutes  
**Purpose**: Test data import/export capabilities

**Steps**:

1. **Export Campaign Data**:
   - Go to `/admin/data`
   - Click "Export CSV" under Campaign Data
   - Verify CSV downloads with campaign information
2. **Import Campaign Data**:
   - Modify CSV file (add new campaign row)
   - Use "Import CSV" to upload modified file
   - Verify new campaign appears in `/admin/campaigns`
3. **Export User Data**:
   - Export user data to see registered accounts
   - Verify user redemption history included

**Expected Result**: CSV files contain complete data, imports work correctly

### Scenario 3: User Journey Testing

**Time Required**: 5-7 minutes  
**Purpose**: Test complete user redemption flow

**Steps**:

1. **Setup**:
   - Create campaign with $25 value
   - Generate redemption codes
   - Generate redemption URL
2. **User Registration**:
   - Open redemption URL in incognito browser
   - Register new user account
   - Complete redemption process
3. **Admin Verification**:
   - Check `/admin/users` for new user
   - Verify user balance updated to $25
   - Check campaign statistics updated
   - Verify code marked as used

**Expected Result**: Complete user journey works, admin can track all activity

### Scenario 4: Campaign State Testing

**Time Required**: 3-4 minutes  
**Purpose**: Test various campaign states and error conditions

**Steps**:

1. **Active Campaign**: Generate URL for active campaign - should work
2. **Inactive Campaign**:
   - Set campaign to inactive in `/admin/campaigns`
   - Test same URL - should show inactive message
3. **Expired Campaign**:
   - Set campaign expiry to past date
   - Test URL - should show expired message
4. **Used Code**:
   - Use a redemption code
   - Test same URL again - should show "already used" message
5. **Component Tester**:
   - Visit `/admin/tests/campaign-info`
   - Test all campaign states using visual component tester

**Expected Result**: All error states display appropriate messages

### Scenario 5: Real Production Testing

**Time Required**: 2-3 minutes  
**Purpose**: Verify production deployment works correctly

**Steps**:

1. **Production Access**: Visit https://h2all-ux-and-api-service-production.up.railway.app/admin
2. **Health Check**: Test `/api/health` endpoint returns "healthy"
3. **Database Connection**: Verify campaigns load from production database
4. **Live URL Generation**: Generate redemption URL and test in production
5. **Mobile Testing**: Test redemption URL on mobile device

**Expected Result**: All features work in production environment

---

## API Testing Tools

### Built-in Test Suites

The application includes comprehensive API testing tools accessible via `/test-api.html`:

#### Campaign API Tests (`/test-campaign-api.html`)

- ✅ Database status check
- ✅ Campaign CRUD operations
- ✅ Redemption code generation
- ✅ Code redemption flow
- ✅ Error condition testing

#### Validation API Tests (`/test-validation-api.html`)

- ✅ Campaign/code validation without redemption
- ✅ Error state testing (expired, used, invalid)
- ✅ Authentication scenarios
- ✅ Edge case handling

#### Redemption API Tests (`/test-redemption-api.html`)

- ✅ Full redemption flow testing
- ✅ User balance updates
- ✅ Duplicate redemption prevention
- ✅ Campaign capacity limits

### Component Testing

#### Campaign Info Component (`/admin/tests/campaign-info`)

Visual testing tool for campaign display component:

- ✅ Test all campaign states (valid, expired, used, etc.)
- ✅ Authentication state testing
- ✅ Error message display
- ✅ Loading states
- ✅ Mobile responsive design

---

## Data Management

### CSV Import/Export Schema

#### Campaign Data Format

```csv
id,name,redemptionValue,isActive,description,maxRedemptions,currentRedemptions,status,createdAt,expiresAt
campaign_h2o_clean_2025,Clean Water Initiative 2025,25,true,"Support clean water access",100,0,active,2025-08-05,2025-12-31
```

#### Redemption Code Format

```csv
id,uniqueCode,campaignId,isUsed,redemptionValue,usedAt,userEmail
1,H2O-CLEAN-001-V2,campaign_h2o_clean_2025,false,25,,
```

#### User Data Format

```csv
id,email,firstName,lastName,balance,isActive,createdAt,lastLogin
1,user@example.com,John,Doe,25.00,true,2025-08-05,2025-08-05
```

---

## Production URLs

### Admin Interface

- **Dashboard**: `/admin`
- **Campaign Manager**: `/admin/campaigns`
- **Code Generator**: `/admin/codes`
- **User Management**: `/admin/users`
- **Data Analytics**: `/admin/data`
- **URL Tester**: `/admin/test-redemption-urls`

### Testing Tools

- **API Test Suite**: `/test-api.html`
- **Campaign Tests**: `/test-campaign-api.html`
- **Validation Tests**: `/test-validation-api.html`
- **Component Tests**: `/admin/tests/campaign-info`

### API Endpoints

- **Health Check**: `/api/health`
- **Campaigns**: `/api/campaigns`
- **Redemption**: `/api/campaigns/redeem`
- **Validation**: `/api/campaigns/validate`
- **Admin Data**: `/api/admin/data/*`

---

## Troubleshooting

### Common Issues

1. **"Authentication Required"**: Ensure logged in as admin user
2. **"Campaign Not Found"**: Verify campaign exists and is active
3. **"Code Already Used"**: Check code status in `/admin/codes`
4. **"Database Connection Error"**: Check `/api/health` endpoint

### Error Monitoring

- All admin actions logged to browser console
- Database errors return structured JSON responses
- Failed operations show user-friendly error messages
- CSV import/export includes detailed error reporting

### Support Information

- **Database**: PostgreSQL on Railway
- **Framework**: Next.js 15.4.5
- **Authentication**: JWT tokens with secure cookies
- **Production**: Deployed on Railway with automatic deployments

---

_Last Updated: August 5, 2025_  
_Version: 1.0.2_
