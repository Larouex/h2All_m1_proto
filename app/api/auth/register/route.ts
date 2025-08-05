import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  generateToken,
  validateEmail,
  validatePassword,
  checkRateLimit,
  generateSecureRandom,
} from "@/app/lib/auth";
import { userQueries } from "@/app/lib/database-pg";
import type { RegisterUserDto } from "@/types/user";

// Specify runtime for Node.js compatibility
export const runtime = "nodejs";

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

  return "127.0.0.1";
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

    console.log(
      `Registration attempt for email: ${email} from IP: ${clientIP}`
    );

    // Check if user already exists
    try {
      const existingUser = await userQueries.findByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("Error checking existing user:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Hash password securely
    const passwordHash = await hashPassword(password);

    // Check if this is the first user in the system (make them admin)
    let isFirstUser = false;
    try {
      const allUsers = await userQueries.list(1, 0); // Just check if any users exist
      isFirstUser = allUsers.length === 0;
    } catch (error) {
      console.log(
        "Could not check existing users, assuming not first user:",
        error
      );
      isFirstUser = false;
    }

    // Create user
    try {
      const newUser = await userQueries.create({
        email: email.toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country.trim(),
        passwordHash,
        balance: "0",
        isActive: true,
        isAdmin: isFirstUser,
        totalRedemptions: 0,
        totalRedemptionValue: "0",
      });

      console.log(`User registered successfully: ${email}`);

      // Generate JWT token for immediate login
      const token = generateToken({
        userId: newUser.id,
        email: email.toLowerCase(),
        isAdmin: isFirstUser,
      });

      // Generate session ID
      const sessionId = generateSecureRandom(32);

      // Create response
      const response = NextResponse.json({
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          country: newUser.country,
          balance: Number(newUser.balance),
          isActive: newUser.isActive,
          isAdmin: newUser.isAdmin,
          totalRedemptions: newUser.totalRedemptions,
          totalRedemptionValue: Number(newUser.totalRedemptionValue),
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

      return response;
    } catch (error) {
      console.error("User creation error:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
