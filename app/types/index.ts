// Export all TypeScript interfaces and types

// Campaign types
export type {
  Campaign,
  CampaignEntity,
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignFilters,
} from "./campaign";

// Redemption types
export type {
  RedemptionCode,
  RedemptionCodeEntity,
  CreateRedemptionCodeDto,
  RedeemCodeDto,
  RedemptionCodeFilters,
  RedemptionStats,
  BatchCodeGenerationResult,
} from "./redemption";

// User types
export type {
  User,
  UserEntity,
  RegisterUserDto,
  LoginUserDto,
  UpdateUserDto,
  BalanceOperation,
  UserStats,
} from "./user";
