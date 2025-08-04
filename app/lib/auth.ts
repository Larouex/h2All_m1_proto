import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import crypto from "crypto";
import type { UserEntity } from "@/types/user";

// Environment variables for security
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = 12;

export interface AuthTokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export interface SessionData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    balance: number;
    isActive: boolean;
    isAdmin: boolean;
  };
  token: string;
}

/**
 * Hash password using bcrypt with salt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error("Password hashing failed:", error);
    throw new Error("Password hashing failed");
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(
  payload: Omit<AuthTokenPayload, "iat" | "exp">
): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "h2all-m1",
      audience: "h2all-users",
    } as jwt.SignOptions);
  } catch (error) {
    console.error("Token generation failed:", error);
    throw new Error("Token generation failed");
  }
}

/**
 * Verify and decode JWT token (Node.js runtime)
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "h2all-m1",
      audience: "h2all-users",
    } as jwt.VerifyOptions) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Verify and decode JWT token (Edge runtime compatible)
 */
export async function verifyTokenEdge(
  token: string
): Promise<AuthTokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "h2all-m1",
      audience: "h2all-users",
    });

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      isAdmin: payload.isAdmin as boolean,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Generate secure random string for CSRF protection or session IDs
 */
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Rate limiting helper - simple in-memory store
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // First attempt or window expired
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxAttempts - 1, resetTime };
  }

  if (record.count >= maxAttempts) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count += 1;
  rateLimitStore.set(identifier, record);
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Input validation helpers
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Authenticate user with email and password
 */
export async function authenticate(
  email: string,
  password: string
): Promise<UserEntity | null> {
  try {
    // Azure Table Storage configuration
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (!accountName || !accountKey) {
      console.error("Azure Storage configuration missing");
      return null;
    }

    // Import Azure Table Storage client
    const { TableClient, AzureNamedKeyCredential } = await import(
      "@azure/data-tables"
    );

    const tableName = "users";
    const tableEndpoint = `https://${accountName}.table.core.windows.net`;
    const credential = new AzureNamedKeyCredential(accountName, accountKey);
    const tableClient = new TableClient(tableEndpoint, tableName, credential);

    // Helper function to encode email for rowKey (MUST match registration exactly)
    function encodeEmailToRowKey(email: string): string {
      const lowercaseEmail = email.toLowerCase();
      return Buffer.from(lowercaseEmail).toString("base64");
    }

    const partitionKey = "users";
    const rowKey = encodeEmailToRowKey(email);

    // Query user from database
    const userEntity = await tableClient.getEntity(partitionKey, rowKey);

    if (!userEntity || !userEntity.IsActive) {
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(
      password,
      (userEntity.PasswordHash as string) || ""
    );

    if (!isValid) {
      return null;
    }

    // Return user data (this matches UserEntity interface)
    return {
      partitionKey: userEntity.partitionKey as string,
      rowKey: userEntity.rowKey as string,
      Email: userEntity.Email as string,
      FirstName: userEntity.FirstName as string,
      LastName: userEntity.LastName as string,
      Country: userEntity.Country as string,
      PasswordHash: userEntity.PasswordHash as string,
      Balance: userEntity.Balance as number,
      IsActive: userEntity.IsActive as boolean,
      IsAdmin: (userEntity.IsAdmin as boolean) || false, // Default to false if not set
      CreatedDateTime: userEntity.CreatedDateTime as Date,
      TotalRedemptions: userEntity.TotalRedemptions as number,
      TotalRedemptionValue: userEntity.TotalRedemptionValue as number,
      UpdatedAt: userEntity.UpdatedAt as Date | string,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}
/**
 * Create JWT token
 */
export async function createJWT(payload: AuthTokenPayload): Promise<string> {
  return generateToken({
    userId: payload.userId,
    email: payload.email,
    isAdmin: payload.isAdmin,
  });
}

/**
 * Get user info from request cookies
 */
export function getUserFromRequest(request: Request): AuthTokenPayload | null {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((cookie) => {
        const [name, value] = cookie.split("=");
        return [name, decodeURIComponent(value)];
      })
    );

    const token = cookies["auth-token"];
    if (!token) return null;

    return verifyToken(token);
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}

/**
 * Check if user is admin from request
 */
export function isAdminUser(request: Request): boolean {
  const user = getUserFromRequest(request);
  return user?.isAdmin || false;
}

/**
 * Sanitize user data for API responses (remove sensitive fields)
 */
export function sanitizeUser(
  user: UserEntity
): Omit<UserEntity, "PasswordHash"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { PasswordHash, ...sanitized } = user;
  return sanitized;
}
