import { NextRequest, NextResponse } from "next/server";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";
import {
  hashPassword,
  generateToken,
  validateEmail,
  validatePassword,
  checkRateLimit,
  generateSecureRandom,
} from "@/lib/auth";
import type { UserEntity, RegisterUserDto } from "@/types/user";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

// Configuration constants
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const tableName = "users";

// Table endpoint URL
const tableEndpoint = `https://${accountName}.table.core.windows.net`;

// Create credentials and table client
const credential = new AzureNamedKeyCredential(accountName, accountKey);
const tableClient = new TableClient(tableEndpoint, tableName, credential);

// Helper function to encode email for rowKey (MUST match login exactly)
function encodeEmailToRowKey(email: string): string {
  const lowercaseEmail = email.toLowerCase();
  return Buffer.from(lowercaseEmail).toString("base64");
}

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterUserDto = await request.json();
    const { email, firstName, lastName, country, password } = body;

    // Input validation
    if (!email || !firstName || !lastName || !country || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: "Password does not meet requirements",
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Rate limiting by IP address
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`register_${clientIP}`, 3, 60 * 60 * 1000); // 3 registrations per hour

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Too many registration attempts. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": "3",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Define the partitionKey and rowKey
    const partitionKey = "users";
    const rowKey = encodeEmailToRowKey(email);

    console.log(
      `Registration attempt for email: ${email} from IP: ${clientIP}`
    );

    // Check if user already exists
    try {
      await tableClient.getEntity(partitionKey, rowKey);
      // User exists
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    } catch (error: unknown) {
      const azureError = error as { statusCode?: number };
      if (azureError.statusCode !== 404) {
        // Unexpected error
        throw error;
      }
      // User doesn't exist, continue with registration
    }

    // Hash password securely
    const passwordHash = await hashPassword(password);

    // Check if this is the first user in the system (make them admin)
    let isFirstUser = false;
    try {
      const existingUsers = tableClient.listEntities({
        queryOptions: { select: ["RowKey"] },
      });
      let userCount = 0;
      for await (const user of existingUsers) {
        userCount++;
        if (userCount > 0) break; // We only need to know if there are any users
      }
      isFirstUser = userCount === 0;
    } catch (error) {
      console.log(
        "Could not check existing users, assuming not first user:",
        error
      );
      isFirstUser = false;
    }

    // Create user entity
    const newUser: UserEntity = {
      partitionKey,
      rowKey,
      Email: email.toLowerCase(),
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      Country: country.trim(),
      PasswordHash: passwordHash,
      Balance: 0,
      CreatedDateTime: new Date(),
      IsActive: true,
      IsAdmin: isFirstUser, // First user becomes admin automatically
      TotalRedemptions: 0,
      TotalRedemptionValue: 0,
      UpdatedAt: new Date(),
    };

    // Save user to database
    await tableClient.createEntity(newUser);

    console.log(`User registered successfully: ${email}`);

    // Generate JWT token for immediate login
    const token = generateToken({
      userId: rowKey,
      email: email.toLowerCase(),
      isAdmin: isFirstUser, // Match the database record
    });

    // Generate session ID
    const sessionId = generateSecureRandom(32);

    // Create response
    const response = NextResponse.json({
      user: {
        id: rowKey,
        email: email.toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country.trim(),
        balance: 0,
        isActive: true,
        isAdmin: isFirstUser, // Match the database record
        totalRedemptions: 0,
        totalRedemptionValue: 0,
      },
      sessionId,
      message: "Registration successful",
    });

    // Set secure HTTP-only cookie with JWT token
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    // Set session ID cookie for additional CSRF protection
    response.cookies.set("session-id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    // Add security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  } catch (error) {
    console.error("Error in registration API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Prevent other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
