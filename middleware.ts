import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Define which routes require authentication
const protectedRoutes = ["/admin", "/dashboard", "/profile"];
const authRoutes = ["/auth", "/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the JWT token from cookies
  const authToken = request.cookies.get("auth-token")?.value;

  // Check if the current path requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If it's a protected route
  if (isProtectedRoute) {
    // No token present
    if (!authToken) {
      const loginUrl = new URL("/auth", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the token
    const payload = verifyToken(authToken);
    if (!payload) {
      // Invalid or expired token
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
  }

  // If it's an auth route and user is already authenticated
  if (isAuthRoute && authToken) {
    const payload = verifyToken(authToken);
    if (payload) {
      // Redirect to admin dashboard if already authenticated
      const redirectTo =
        request.nextUrl.searchParams.get("redirect") || "/admin";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // Allow the request to proceed
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
