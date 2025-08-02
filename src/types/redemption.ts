// Redemption Code TypeScript interfaces for Azure Data Tables

// Base RedemptionCode interface
export interface RedemptionCode {
  id: string;
  campaignId: string;
  uniqueCode: string;
  isUsed: boolean;
  redeemedAt: Date | null;
  userId: string | null;
  createdAt: Date;
  userEmail?: string; // For easier lookup and display
}

// Azure Data Tables entity for RedemptionCode
export interface RedemptionCodeEntity {
  partitionKey: string; // campaign ID for efficient querying by campaign
  rowKey: string; // redemption code ID
  CampaignId: string;
  UniqueCode: string;
  IsUsed: boolean;
  RedeemedAt: Date | null;
  UserId: string | null;
  CreatedDateTime: Date;
  UserEmail?: string;
}

// Redemption code creation data transfer object
export interface CreateRedemptionCodeDto {
  campaignId: string;
  quantity: number; // Number of codes to generate
}

// Redemption code usage data transfer object
export interface RedeemCodeDto {
  uniqueCode: string;
  userId: string;
  userEmail: string;
}

// Redemption code query filters
export interface RedemptionCodeFilters {
  campaignId?: string;
  isUsed?: boolean;
  userId?: string;
  userEmail?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Redemption statistics
export interface RedemptionStats {
  campaignId: string;
  totalCodes: number;
  usedCodes: number;
  unusedCodes: number;
  redemptionRate: number; // percentage
  totalValue: number; // total value redeemed
}

// Batch redemption code generation result
export interface BatchCodeGenerationResult {
  campaignId: string;
  codesGenerated: number;
  codes: string[]; // Array of generated unique codes
  success: boolean;
  errors?: string[];
}
