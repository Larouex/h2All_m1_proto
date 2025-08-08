import { NextRequest, NextResponse } from "next/server";
import { verifyToken, AuthTokenPayload } from "@/lib/auth";

/**
 * Middleware to check if user is authenticated and is an admin
 */
export async function checkAdminAuth(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  user?: AuthTokenPayload;
  error?: string;
}> {
  try {
    // Get token from Authorization header or cookies
    let token: string | null = null;

    // First try Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Fallback to cookies
    if (!token) {
      token = request.cookies.get("auth-token")?.value || null;
    }

    if (!token) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: "No authentication token provided",
      };
    }

    // Verify the token
    const payload = verifyToken(token);
    if (!payload) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: "Invalid or expired token",
      };
    }

    return {
      isAuthenticated: true,
      isAdmin: payload.isAdmin || false,
      user: payload,
    };
  } catch (error) {
    console.error("Admin auth check failed:", error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      error: "Authentication verification failed",
    };
  }
}

/**
 * Check if request is coming from allowed origins/referrers
 */
export function checkRequestOrigin(
  request: NextRequest,
  allowedPaths: string[]
): boolean {
  // Get the referer header to see which page made the request
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");

  if (!referer && !origin) {
    // No referer/origin means direct API call - block it
    return false;
  }

  // Parse the referer URL to get the pathname
  try {
    const refererUrl = new URL(referer || origin || "");
    const pathname = refererUrl.pathname;

    // Check if the request is coming from an allowed path
    return allowedPaths.some(
      (allowedPath) =>
        pathname === allowedPath || pathname.startsWith(allowedPath + "/")
    );
  } catch {
    return false;
  }
}

/**
 * Unified API protection middleware
 */
export async function protectAPI(
  request: NextRequest,
  options: {
    requireAdmin?: boolean;
    allowedPaths?: string[];
    publicEndpoint?: boolean;
  } = {}
): Promise<NextResponse | null> {
  const {
    requireAdmin = true,
    allowedPaths = [],
    publicEndpoint = false,
  } = options;

  // If it's a public endpoint, allow it
  if (publicEndpoint) {
    return null; // null means continue processing
  }

  // Check origin/referer for non-admin endpoints
  if (!requireAdmin && allowedPaths.length > 0) {
    if (!checkRequestOrigin(request, allowedPaths)) {
      return NextResponse.json(
        {
          error: "Unauthorized: Request not from allowed page",
          code: "INVALID_ORIGIN",
        },
        { status: 403 }
      );
    }
    return null; // Continue processing
  }

  // For admin-required endpoints, check authentication
  const auth = await checkAdminAuth(request);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      {
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      },
      { status: 401 }
    );
  }

  if (requireAdmin && !auth.isAdmin) {
    return NextResponse.json(
      {
        error: "Admin access required",
        code: "ADMIN_REQUIRED",
      },
      { status: 403 }
    );
  }

  // If we get here, the request is authorized
  return null;
}

/**
 * Wrapper for API routes that need admin protection
 */
export function withAdminAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authCheck = await protectAPI(request, { requireAdmin: true });
    if (authCheck) return authCheck;

    return handler(request);
  };
}

/**
 * Wrapper for API routes that need origin protection
 */
export function withOriginAuth(
  handler: (request: NextRequest) => Promise<NextResponse>,
  allowedPaths: string[]
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authCheck = await protectAPI(request, {
      requireAdmin: false,
      allowedPaths,
    });
    if (authCheck) return authCheck;

    return handler(request);
  };
}
