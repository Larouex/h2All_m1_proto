// Campaign TypeScript interfaces for PostgreSQL database

// Base Campaign interface
export interface Campaign {
  id: string;
  name: string;
  redemptionValue: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  description?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
}

// PostgreSQL database entity for Campaign
export interface CampaignEntity {
  partitionKey: string; // "campaign" for all campaigns
  rowKey: string; // campaign ID
  Name: string;
  RedemptionValue: number;
  IsActive: boolean;
  CreatedDateTime: Date;
  ExpiresAt: Date;
  Description?: string;
  MaxRedemptions?: number;
  CurrentRedemptions: number;
  Status?: string; // active, inactive, expired
  TotalRedemptions?: number; // Total redemptions processed
  TotalRedemptionValue?: number; // Total value redeemed
  UpdatedAt?: Date | string; // Last update timestamp
}

// Campaign creation data transfer object
export interface CreateCampaignDto {
  name: string;
  redemptionValue: number;
  description?: string;
  expiresAt: Date;
  maxRedemptions?: number;
}

// Campaign update data transfer object
export interface UpdateCampaignDto {
  name?: string;
  redemptionValue?: number;
  isActive?: boolean;
  description?: string;
  expiresAt?: Date;
  maxRedemptions?: number;
}

// Campaign query filters
export interface CampaignFilters {
  isActive?: boolean;
  isExpired?: boolean;
  minRedemptionValue?: number;
  maxRedemptionValue?: number;
}
