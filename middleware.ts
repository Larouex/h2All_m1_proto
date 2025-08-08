import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "./app/lib/auth-edge";

// Define which routes require authentication
const protectedRoutes = ["/admin", "/dashboard", "/profile"];
const authRoutes = ["/auth", "/register"];

// Define API routes that require admin access
const adminApiRoutes = ["/api/admin"];

// Define API routes that require origin validation (only from specific pages)
const originProtectedApis = {
  "/api/emailclaim": ["/emailclaim"],
  "/api/campaigns/redeem": ["/track", "/redeem"],
  "/api/redeem": ["/track", "/redeem"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin API route
  const isAdminApi = adminApiRoutes.some((route) => pathname.startsWith(route));

  // Check if this is an origin-protected API
  const originProtectedApi = Object.keys(originProtectedApis).find((route) =>
    pathname.startsWith(route)
  );

  // Handle API protection first
  if (isAdminApi) {
    // Admin API protection
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const payload = await verifyTokenEdge(authToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    if (!payload.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required", code: "ADMIN_REQUIRED" },
        { status: 403 }
      );
    }

    // Admin authenticated, continue
    return NextResponse.next();
  }

  // Handle origin-protected APIs
  if (originProtectedApi) {
    const allowedPaths =
      originProtectedApis[
        originProtectedApi as keyof typeof originProtectedApis
      ];
    const referer = request.headers.get("referer");

    if (!referer) {
      return NextResponse.json(
        { error: "Direct API access not allowed", code: "NO_REFERER" },
        { status: 403 }
      );
    }

    try {
      const refererUrl = new URL(referer);
      const refererPath = refererUrl.pathname;

      const isAllowed = allowedPaths.some(
        (allowedPath) =>
          refererPath === allowedPath ||
          refererPath.startsWith(allowedPath + "/")
      );

      if (!isAllowed) {
        return NextResponse.json(
          { error: "Unauthorized page access", code: "INVALID_ORIGIN" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid referer", code: "INVALID_REFERER" },
        { status: 403 }
      );
    }

    // Origin validated, continue
    return NextResponse.next();
  }

  // Get the JWT token from cookies for page routes
  const authToken = request.cookies.get("auth-token")?.value;

  // Check if the current path requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Handle auth routes first - these should always be accessible
  if (isAuthRoute) {
    console.log(
      "Auth route accessed:",
      pathname,
      "Token present:",
      !!authToken
    );
    // Always allow access to auth routes - let the auth page handle authentication logic
    return NextResponse.next();
  }

  // If it's a protected route
  if (isProtectedRoute) {
    // No token present
    if (!authToken) {
      const loginUrl = new URL("/auth", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the token
    const payload = await verifyTokenEdge(authToken);
    if (!payload) {
      // Invalid or expired token - redirect to auth and clear cookies
      const response = NextResponse.redirect(new URL("/auth", request.url));

      // Clear invalid cookies
      response.cookies.set("auth-token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });

      return response;
    }

    // Check if the route requires admin access
    if (pathname.startsWith("/admin") && !payload.isAdmin) {
      // User is authenticated but not an admin
      return NextResponse.redirect(
        new URL("/?error=admin-required", request.url)
      );
    }

    // Token is valid and user has necessary permissions
    return NextResponse.next();
  }

  // For all other routes, continue without authentication
  return NextResponse.next();
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    // Match API routes
    "/api/(.*)",
    // Match protected pages
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    // Match auth pages
    "/auth/:path*",
    "/register/:path*",
  ],
};
