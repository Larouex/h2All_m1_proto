import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "./app/lib/auth-edge";

// Define which routes require authentication
const protectedRoutes = ["/admin", "/dashboard", "/profile"];
const authRoutes = ["/auth", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the JWT token from cookies
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

      response.cookies.set("session-id", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });

      return response;
    }

    // Check admin access for /admin routes specifically
    if (pathname.startsWith("/admin") && !payload.isAdmin) {
      // Redirect non-admin users to home page with error message
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "admin-required");
      return NextResponse.redirect(homeUrl);
    }
  }

  // Allow the request to proceed for all other routes
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
