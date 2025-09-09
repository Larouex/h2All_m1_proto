/**
 * API Security Utilities
 * Provides security functions for API route protection without middleware complexity
 */

export interface SecurityConfig {
  allowedOrigins: string[];
  requireApiKey: boolean;
  securityLevel: "basic" | "enhanced";
}

export interface SecurityResult {
  allowed: boolean;
  reason?: string;
  headers?: Record<string, string>;
}

/**
 * Parse allowed origins from environment variable
 */
export function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS || "";
  if (!origins) {
    // Default to localhost and production domains if not set
    return [
      "http://localhost:3000",
      "http://localhost:3002",
      "https://h2allm1monitor-production.up.railway.app",
      "https://h2all-ux-and-api-service-production.up.railway.app",
      "https://redeem.h2all.com",
    ];
  }
  return origins.split(",").map((origin) => origin.trim());
}

/**
 * Validate request origin against allowed origins
 */
export function validateOrigin(request: Request): boolean {
  // TEMPORARY: Allow all origins in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = getAllowedOrigins();

  console.log("🔍 Origin validation:", {
    origin,
    referer,
    allowedOrigins,
    url: request.url
  });

  // Allow requests without origin (direct API calls, server-to-server)
  if (!origin && !referer) {
    console.log("✅ No origin/referer - allowing");
    return true;
  }

  // Check origin header
  if (origin && allowedOrigins.includes(origin)) {
    console.log("✅ Origin allowed:", origin);
    return true;
  }

  // Check referer header (fallback)
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      const allowed = allowedOrigins.includes(refererOrigin);
      console.log("🔍 Referer check:", { refererOrigin, allowed });
      return allowed;
    } catch {
      console.log("❌ Invalid referer URL");
      return false;
    }
  }

  console.log("❌ Origin not allowed");
  return false;
}

/**
 * Validate API key if required
 */
export function validateApiKey(request: Request): boolean {
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  const validApiKey = process.env.API_KEY;

  console.log("🔑 API Key check:", {
    receivedKey: apiKey,
    validKey: validApiKey,
    hasValidKey: !!validApiKey,
    match: apiKey === validApiKey
  });

  if (!validApiKey) {
    // If no API key is configured, allow the request
    console.log("✅ No API key configured - allowing");
    return true;
  }

  const isValid = apiKey === validApiKey;
  console.log(isValid ? "✅ API key valid" : "❌ API key invalid");
  return isValid;
}

/**
 * Get security headers for response
 */
export function getSecurityHeaders(): Record<string, string> {
  const allowedOrigins = getAllowedOrigins();

  return {
    "Access-Control-Allow-Origin": allowedOrigins.join(", "),
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    "Access-Control-Max-Age": "86400", // 24 hours
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

/**
 * Main security validation function
 */
export function validateSecurity(
  request: Request,
  config: SecurityConfig
): SecurityResult {
  // Check origin validation
  if (!validateOrigin(request)) {
    return {
      allowed: false,
      reason: "Origin not allowed",
    };
  }

  // Check API key if required
  if (config.requireApiKey && !validateApiKey(request)) {
    return {
      allowed: false,
      reason: "Invalid or missing API key",
    };
  }

  return {
    allowed: true,
    headers: getSecurityHeaders(),
  };
}

/**
 * Security wrapper for API route handlers
 */
export function withSecurity<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>,
  config: SecurityConfig
) {
  return async (...args: T): Promise<Response> => {
    // Extract request from arguments (usually first argument)
    const request = args[0] as Request;

    // Handle OPTIONS requests for CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: getSecurityHeaders(),
      });
    }

    // Validate security
    const securityResult = validateSecurity(request, config);

    if (!securityResult.allowed) {
      return new Response(
        JSON.stringify({
          error: "Access denied",
          reason: securityResult.reason,
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            ...getSecurityHeaders(),
          },
        }
      );
    }

    try {
      // Call the original handler
      const response = await handler(...args);

      // Add security headers to response
      const headers = new Headers(response.headers);
      Object.entries(securityResult.headers || {}).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error("API handler error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...getSecurityHeaders(),
          },
        }
      );
    }
  };
}

/**
 * Predefined security configurations
 */
export const SECURITY_CONFIGS = {
  PUBLIC: {
    allowedOrigins: getAllowedOrigins(),
    requireApiKey: false,
    securityLevel: "basic" as const,
  },
  PROTECTED: {
    allowedOrigins: getAllowedOrigins(),
    requireApiKey: true,
    securityLevel: "enhanced" as const,
  },
  ADMIN: {
    allowedOrigins: getAllowedOrigins(),
    requireApiKey: true,
    securityLevel: "enhanced" as const,
  },
} as const;
