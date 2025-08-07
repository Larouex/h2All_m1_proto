# CampaignProgress Component

A reusable React component for displaying campaign progress with an admin editor for title and description. The component fetches campaign funding data from the database and provides an editing interface for administrators.

## Features

- **Database Integration**: Fetches real campaign data including funding goals and current funding amounts
- **Admin Editor**: Allows administrators to edit campaign title and description
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Loading States**: Shows loading spinner while fetching data
- **Error Handling**: Graceful fallback to default data if campaign not found
- **Real-time Updates**: Reflects changes immediately after saving

## Usage

### Basic Usage

```tsx
import CampaignProgress from "@/app/components/CampaignProgress";

// Use with specific campaign ID
<CampaignProgress campaignId="kodema-village" className="mt-3" />

// Use with default campaign data
<CampaignProgress />
```

### Props

| Prop         | Type     | Default     | Description                                      |
| ------------ | -------- | ----------- | ------------------------------------------------ |
| `campaignId` | `string` | `"default"` | The ID of the campaign to fetch from database    |
| `className`  | `string` | `""`        | Additional CSS classes to apply to the component |

### API Integration

The component integrates with these API endpoints:

#### Get Campaign Data

- **Endpoint**: `GET /api/campaigns?id={campaignId}`
- **Purpose**: Fetch campaign details including funding amounts
- **Response**: Campaign object with funding goals and current funding

#### Update Campaign (Admin Only)

- **Endpoint**: `PUT /api/campaigns/{campaignId}`
- **Purpose**: Update campaign title and description
- **Auth**: Requires admin authentication
- **Body**: `{ name: string, description: string }`

### Database Schema

The component expects campaigns with these fields:

```typescript
interface CampaignData {
  id: string;
  name: string; // Campaign title
  description: string; // Campaign description
  fundingGoal: number; // Target funding amount
  currentFunding: number; // Current funding raised
  totalRedemptionValue: number; // Total redemptions processed
  isActive: boolean; // Campaign status
}
```

### Admin Features

When a user with admin privileges is logged in:

1. **Edit Button**: Pencil icon appears next to the campaign title
2. **Modal Editor**: Click to open editing modal with:
   - Title input field
   - Description textarea
   - Campaign statistics display
   - Save/Cancel buttons
3. **Real-time Stats**: Shows total redemption value for admin users

### Styling

The component uses:

- **React Bootstrap**: Card, Button, ProgressBar, Modal, Form components
- **Bootstrap Icons**: Pencil icon for edit button
- **Custom Styling**: 8px height progress bar, mobile-optimized padding
- **Responsive Design**: Works on all screen sizes

### Sample Campaign Creation

Use the seed endpoint to create sample data:

```bash
# Create sample campaign data
GET /api/campaigns/seed
```

This creates a "Kodema Village Water Project" campaign with realistic funding data.

### Error Handling

The component handles several error scenarios:

1. **Network Errors**: Falls back to default campaign data
2. **Campaign Not Found**: Uses default data with standard values
3. **Authentication Errors**: Hides admin features for non-admin users
4. **Database Errors**: Shows error message in loading state

### Default Fallback Data

When campaign data can't be fetched, the component uses:

```typescript
{
  id: "default",
  name: "Campaign Progress",
  description: "Our goal: clean water within 5 minutes of every home in Kodema Village.",
  fundingGoal: 5000,
  currentFunding: 412.05,
  totalRedemptionValue: 412.05,
  isActive: true
}
```

### Implementation Example

Used in the Claimed2 page:

```tsx
// Replace static campaign progress section
<CampaignProgress campaignId="kodema-village" className="mt-3" />
```

This provides a dynamic, editable campaign progress display that integrates with the H2All database and admin system.

## Development Notes

- Component requires authentication context (`useAuth`)
- Uses fetch API with credentials for admin operations
- Implements proper TypeScript interfaces for type safety
- Follows mobile-first responsive design principles
- Uses React Bootstrap for consistent UI components
