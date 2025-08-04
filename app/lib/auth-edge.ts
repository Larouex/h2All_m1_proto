import { jwtVerify } from "jose";

// Environment variables for security
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
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
