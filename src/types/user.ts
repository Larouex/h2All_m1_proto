// Updated User TypeScript interfaces for Azure Data Tables

// Base User interface with balance field
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  balance: number; // New field for user balance
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  totalRedemptions: number; // Track total redemptions count
  totalRedemptionValue: number; // Track total value redeemed
}

// Azure Data Tables entity for User (updated)
export interface UserEntity {
  partitionKey: string; // "user" for all users
  rowKey: string; // encoded email (base64)
  Email: string;
  FirstName: string;
  LastName: string;
  Country: string;
  PasswordHash?: string;
  Balance: number; // New field
  CreatedDateTime: Date;
  LastLoginAt?: Date;
  IsActive: boolean;
  TotalRedemptions: number; // New field
  TotalRedemptionValue: number; // New field
  UpdatedAt?: Date | string; // Last update timestamp
}

// User registration data transfer object
export interface RegisterUserDto {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  password: string;
}

// User login data transfer object
export interface LoginUserDto {
  email: string;
  password: string;
}

// User profile update data transfer object
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  country?: string;
}

// User balance operations
export interface BalanceOperation {
  userId: string;
  amount: number;
  operation: "add" | "subtract";
  reason: string;
  referenceId?: string; // e.g., redemption code ID
}

// User statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalBalance: number;
  averageBalance: number;
  totalRedemptions: number;
  totalRedemptionValue: number;
}
