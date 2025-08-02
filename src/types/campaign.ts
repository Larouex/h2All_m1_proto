// Campaign TypeScript interfaces for Azure Data Tables

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

// Azure Data Tables entity for Campaign
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
