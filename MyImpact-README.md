# MyImpact Component Documentation

A React component that displays user-specific impact metrics based on their redemption activity in H2ALL campaigns. The component fetches real data from the database and shows personalized statistics about bottles claimed, water funded, and contributions made.

## Features

- **User-Specific Data**: Shows impact metrics for the authenticated user only
- **Campaign Filtering**: Can display impact for specific campaigns or all campaigns
- **Real-time Data**: Fetches live data from redemption_codes table
- **Authentication Aware**: Handles logged-in and guest user states gracefully
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Loading States**: Shows loading spinner while fetching data
- **Error Handling**: Graceful fallback for network errors or missing data

## Usage

### Basic Usage

```tsx
import MyImpact from "@/app/components/MyImpact";

// Show impact for specific campaign
<MyImpact campaignId="kodema-village" className="mt-3" />

// Show impact across all campaigns
<MyImpact />
```

### Props

| Prop         | Type      | Default     | Description                                |
| ------------ | --------- | ----------- | ------------------------------------------ |
| `campaignId` | `string?` | `undefined` | Optional campaign ID to filter impact data |
| `className`  | `string?` | `""`        | Additional CSS classes to apply            |

## Data Sources

### Database Tables

The component queries these database tables:

```sql
-- Primary data from redemption_codes table
SELECT
  redemption_codes.id,
  redemption_codes.campaign_id,
  redemption_codes.redemption_value,
  redemption_codes.redeemed_at,
  campaigns.name as campaign_name
FROM redemption_codes
LEFT JOIN campaigns ON redemption_codes.campaign_id = campaigns.id
WHERE redemption_codes.user_id = ?
  AND redemption_codes.is_used = true
  [AND redemption_codes.campaign_id = ?] -- if campaignId provided
ORDER BY redemption_codes.redeemed_at
```

### API Integration

#### Get User Impact Data

- **Endpoint**: `GET /api/user/impact`
- **Query Parameters**:
  - `userId` (required): User ID to get impact for
  - `campaignId` (optional): Filter by specific campaign
- **Authentication**: Required (user can only access own data, admin can access any)
- **Response**: Impact metrics and redemption history

#### Seed Sample Data

- **Endpoint**: `GET /api/user/impact/seed`
- **Purpose**: Creates sample redemption data for testing
- **Creates**: 3 sample bottle redemptions with realistic dates and values

## Impact Metrics

### Displayed Metrics

1. **Claimed Bottles**

   - Icon: 👥 (bi-people-fill)
   - Count of redeemed bottles (where `is_used = true`)
   - Direct count from redemption_codes table

2. **Clean Water Funded**

   - Icon: 💧 (bi-droplet-fill, text-primary)
   - Calculated as: `claimed_bottles * 10 liters`
   - Represents liters of clean water funded through redemptions

3. **Total Contribution**
   - Icon: 💰 (bi-currency-dollar, text-success)
   - Sum of all `redemption_value` from user's redemptions
   - Formatted as currency ($0.00)

### Calculation Logic

```typescript
// Water funded calculation
const waterFunded = claimedBottles * 10; // 10L per bottle

// Total contribution calculation
const totalContribution = redemptions.reduce(
  (sum, redemption) => sum + Number(redemption.redemptionValue || 0),
  0
);
```

## Component States

### 1. Loading State

```tsx
// Shows spinner while fetching data
<div className="spinner-border spinner-border-sm" role="status">
  <span className="visually-hidden">Loading...</span>
</div>
```

### 2. Unauthenticated State

```tsx
// Shows sign-in prompt for guest users
<div className="text-center text-muted">
  <i className="bi bi-person-circle fs-3 d-block mb-2"></i>
  <p className="small mb-2">Sign in to track your impact</p>
  <button className="btn btn-primary btn-sm">Sign In</button>
</div>
```

### 3. No Impact State

```tsx
// Shows when user has no redemptions yet
<div className="text-center text-muted py-3">
  <i className="bi bi-heart fs-3 d-block mb-2"></i>
  <p className="small mb-2">Start making an impact!</p>
  <p className="small text-muted">
    Redeem bottles to track your contribution to clean water projects.
  </p>
</div>
```

### 4. Active Impact State

```tsx
// Shows metrics with icons and values
<div className="d-flex align-items-center justify-content-between">
  <div className="d-flex align-items-center gap-2">
    <i className="bi bi-droplet-fill text-primary"></i>
    <span className="text-muted small">Clean Water Funded</span>
  </div>
  <span className="fw-bold text-black">30L</span>
</div>
```

### 5. Error State

```tsx
// Shows error message with retry option
<div className="text-center text-muted">
  <i className="bi bi-exclamation-circle fs-3 d-block mb-2"></i>
  <p className="small mb-0">{error}</p>
</div>
```

## Integration Examples

### In Claimed2 Page

```tsx
// Replace static impact section with dynamic component
<MyImpact campaignId="kodema-village" className="mt-3" />
```

### In User Dashboard

```tsx
// Show overall impact across all campaigns
<MyImpact className="mb-4" />
```

### In Campaign Page

```tsx
// Show impact specific to current campaign
<MyImpact campaignId={campaignData.id} />
```

## API Response Format

### Success Response

```json
{
  "claimedBottles": 3,
  "totalContribution": 0.15,
  "waterFunded": 30,
  "campaignName": "Kodema Village Water Project",
  "lastRedemptionDate": "2025-08-05T10:30:00Z",
  "redemptions": [
    {
      "id": "redemption_001",
      "campaignId": "kodema-village",
      "campaignName": "Kodema Village Water Project",
      "value": 0.05,
      "redeemedAt": "2025-08-03T15:20:00Z"
    }
  ]
}
```

### No Impact Response

```json
{
  "claimedBottles": 0,
  "totalContribution": 0,
  "waterFunded": 0,
  "campaignName": "Kodema Village Water Project",
  "lastRedemptionDate": null,
  "message": "No impact data found - start redeeming bottles to track your impact!"
}
```

### Error Response

```json
{
  "error": "Authentication required"
}
```

## Security & Privacy

- **User Isolation**: Users can only access their own impact data
- **Admin Override**: Admin users can view any user's impact data
- **Authentication Required**: All endpoints require valid JWT token
- **Data Validation**: User ID validation and authorization checks

## Styling & Design

- **Mobile-First**: Designed for mobile devices, scales up to desktop
- **Bootstrap Integration**: Uses React Bootstrap Card component
- **Consistent Icons**: Bootstrap Icons for visual consistency
- **Loading States**: Smooth loading transitions
- **Error Handling**: User-friendly error messages

## Testing & Debugging

### Create Sample Data

```bash
# Create sample campaigns first
GET /api/campaigns/seed

# Create sample redemption data
GET /api/user/impact/seed

# Test impact endpoint
GET /api/user/impact?userId=USER_ID&campaignId=CAMPAIGN_ID
```

### Debug Component

```tsx
// Use in debug page for testing
<MyImpact campaignId="kodema-village" className="mb-3" />
<MyImpact className="mb-3" /> // Test without campaign filter
```

### Common Issues

- **No Data Showing**: Run seed endpoints to create sample data
- **Authentication Errors**: Ensure user is logged in
- **Component Not Rendering**: Check import paths and props

## Future Enhancements

- **Time Period Filtering**: Filter impact by date ranges
- **Goal Tracking**: Show progress toward personal impact goals
- **Social Sharing**: Share impact achievements
- **Leaderboards**: Compare impact with other users
- **Impact Visualization**: Charts and graphs for impact trends

---

**Component Created:** August 6, 2025  
**Version:** 1.0.0  
**Dependencies:** React Bootstrap, Auth Context, Database API
