# Campaign & Redemption Code System

This document describes the TypeScript interfaces and database schema for the campaign and redemption code system implemented in the H2All M1 project.

## Overview

The system provides functionality for:

- Managing promotional campaigns with redemption values
- Generating unique redemption codes for campaigns
- Redeeming codes to add value to user accounts
- Tracking redemption statistics and user balances

## Database Schema

### Tables

The system uses Azure Data Tables with the following table structure:

#### 1. Campaigns Table (`campaigns`)

- **Partition Key**: `"campaign"` (for all campaigns)
- **Row Key**: Unique campaign ID
- **Fields**:
  - `Name`: Campaign name
  - `RedemptionValue`: Value added when code is redeemed
  - `IsActive`: Whether campaign accepts new redemptions
  - `CreatedDateTime`: Campaign creation date
  - `ExpiresAt`: Campaign expiration date
  - `Description`: Optional campaign description
  - `MaxRedemptions`: Optional maximum redemption limit
  - `CurrentRedemptions`: Current number of redemptions

#### 2. Redemption Codes Table (`redemptionCodes`)

- **Partition Key**: Campaign ID (for efficient querying by campaign)
- **Row Key**: Unique redemption code ID
- **Fields**:
  - `CampaignId`: Associated campaign ID
  - `UniqueCode`: The actual redemption code (8-character alphanumeric)
  - `IsUsed`: Whether the code has been redeemed
  - `RedeemedAt`: Timestamp when code was redeemed (null if unused)
  - `UserId`: ID of user who redeemed the code (null if unused)
  - `UserEmail`: Email of user who redeemed the code (null if unused)
  - `CreatedDateTime`: Code creation date

#### 3. Users Table (`users`) - Updated

Extended the existing users table with new fields:

- **New Fields**:
  - `Balance`: User's current balance from redemptions
  - `TotalRedemptions`: Total number of codes redeemed
  - `TotalRedemptionValue`: Total value redeemed across all codes

## TypeScript Interfaces

### Campaign Types (`src/types/campaign.ts`)

- `Campaign`: Main campaign interface
- `CampaignEntity`: Azure Table Storage entity
- `CreateCampaignDto`: Data for creating campaigns
- `UpdateCampaignDto`: Data for updating campaigns
- `CampaignFilters`: Query filters for campaigns

### Redemption Types (`src/types/redemption.ts`)

- `RedemptionCode`: Main redemption code interface
- `RedemptionCodeEntity`: Azure Table Storage entity
- `CreateRedemptionCodeDto`: Data for generating codes
- `RedeemCodeDto`: Data for redeeming codes
- `RedemptionCodeFilters`: Query filters for codes
- `RedemptionStats`: Statistics interface
- `BatchCodeGenerationResult`: Batch generation results

### User Types (`src/types/user.ts`)

- `User`: Updated user interface with balance fields
- `UserEntity`: Updated Azure Table Storage entity
- `BalanceOperation`: Interface for balance operations
- `UserStats`: User statistics interface

## API Endpoints

### Campaigns API (`/api/campaigns`)

- **GET**: List campaigns or get specific campaign
  - Query params: `id`, `isActive`
- **POST**: Create new campaign
- **PUT**: Update campaign
  - Query params: `id` (required)
- **DELETE**: Delete campaign
  - Query params: `id` (required)

### Redemption Codes API (`/api/redemption-codes`)

- **GET**: List codes or get specific code
  - Query params: `id`, `campaignId`, `code`, `isUsed`
- **POST**: Generate codes or redeem a code
  - For generation: Body contains `campaignId`, `quantity`
  - For redemption: Query param `action=redeem`, body contains `uniqueCode`, `userId`, `userEmail`

### Test API (`/api/test`)

- **GET**: Database status check with entity counts
- **POST**: Complete database operations test
  - Query params: `operation` (all, tables, campaign, codes, user, redemption)

## Database Configuration (`src/lib/database.ts`)

Provides:

- Table client factory functions
- Pre-configured table clients for each table
- Utility functions for table creation, ID generation, and error handling
- Helper functions for encoding/decoding and validation

Key functions:

- `ensureTablesExist()`: Creates all required tables
- `generateUniqueId()`: Creates unique IDs for entities
- `generateUniqueCode()`: Creates unique redemption codes
- `encodeEmailToRowKey()`: Converts email to table row key

## Testing

### Test Files

1. **API Test Page**: `/public/test-campaign-api.html`

   - Interactive web interface for testing all APIs
   - Forms for creating campaigns and generating codes
   - Buttons for testing redemption flow

2. **Test API**: `/api/test`
   - Automated tests for all database operations
   - Creates test data and verifies CRUD operations
   - Validates complete redemption workflow

### Test Commands

```bash
# Build and verify TypeScript compilation
npm run build

# Test database operations (requires Azure Storage configured)
curl http://localhost:3000/api/test

# Test specific operations
curl "http://localhost:3000/api/test?operation=campaign" -X POST
```

## Setup Requirements

### Environment Variables

Required in `.env.local`:

```
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account
AZURE_STORAGE_ACCOUNT_KEY=your_storage_key
```

### Dependencies

All dependencies are already included in the existing Next.js project:

- `@azure/data-tables`: Azure Table Storage client
- `next`: Next.js framework
- `typescript`: TypeScript support

## Usage Examples

### Create a Campaign

```javascript
const campaign = {
  name: "Holiday Bonus 2024",
  redemptionValue: 25,
  description: "Special holiday promotion",
  expiresAt: "2024-12-31T23:59:59Z",
  maxRedemptions: 1000,
};

const response = await fetch("/api/campaigns", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(campaign),
});
```

### Generate Redemption Codes

```javascript
const codes = {
  campaignId: "campaign-id-here",
  quantity: 100,
};

const response = await fetch("/api/redemption-codes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(codes),
});
```

### Redeem a Code

```javascript
const redemption = {
  uniqueCode: "ABC123XY",
  userId: "user-123",
  userEmail: "user@example.com",
};

const response = await fetch("/api/redemption-codes?action=redeem", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(redemption),
});
```

## Validation Rules

### Campaigns

- Name is required
- Redemption value must be > 0
- Expiration date must be in the future
- Max redemptions must be positive (if specified)

### Redemption Codes

- Campaign must exist and be active
- Campaign must not be expired
- Codes are 8-character alphanumeric strings
- Each code can only be redeemed once
- Maximum 100 codes can be generated at once

### Redemptions

- Code must exist and be unused
- Campaign must be active and not expired
- User information is required
- User balance is automatically updated

## Error Handling

The system includes comprehensive error handling:

- Validation errors return 400 status codes
- Not found errors return 404 status codes
- Azure Table Storage errors are properly handled
- All errors include descriptive messages
- Database connection issues are caught and reported

## Security Considerations

- Input validation on all endpoints
- Proper error messages without sensitive information
- Type-safe implementations prevent injection attacks
- Unique code generation prevents collisions
- Campaign expiration prevents abuse of old codes

This implementation provides a complete, type-safe campaign and redemption code system integrated with the existing H2All M1 Azure infrastructure.
