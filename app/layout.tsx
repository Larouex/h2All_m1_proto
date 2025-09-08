"use client";

import { Nunito_Sans } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import "./styles/negative-margins.css";
import { AuthProvider } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import GoogleAnalytics from "@/app/components/analytics/GoogleAnalytics";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isClaimPage = pathname === "/claim";
  const isEmailClaimPage = pathname === "/emailclaim";
  const isTrackPage = pathname === "/track";
  const isHomePage = pathname === "/";
  const isPrivacyPage = pathname === "/privacy";

  // Determine if page needs authentication
  const needsAuth =
    isAdminPage ||
    (!isClaimPage &&
      !isEmailClaimPage &&
      !isTrackPage &&
      !isHomePage &&
      !isPrivacyPage);

  // Check if we're on redeem subdomain and handle redirects
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isRedeemSubdomain = hostname === "redeem.h2all.com";

      if (isRedeemSubdomain) {
        // On redeem subdomain, only allow these specific pages
        const allowedPages = ["/claim", "/emailclaim", "/track", "/privacy"];
        const isAllowedPage = allowedPages.includes(pathname);

        if (!isAllowedPage) {
          // Redirect to main site for any other pages (including admin)
          window.location.href = "https://h2all.com/";
          return;
        }
      }
    }
  }, [pathname]);

  // Set page title and description
  useEffect(() => {
    document.title = "H2All - Track Your Impact";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Track the environmental impact of your purchases"
      );
    }
  }, []);

  // Helper component to conditionally wrap with AuthProvider
  const ConditionalAuthProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    if (needsAuth) {
      return <AuthProvider>{children}</AuthProvider>;
    }
    return <>{children}</>;
  };

  // For claim flow pages or home page, render without navbar/footer and without padding
  if (
    isClaimPage ||
    isEmailClaimPage ||
    isTrackPage ||
    isHomePage ||
    isPrivacyPage
  ) {
    return (
      <ConditionalAuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <main className="flex-grow-1">{children}</main>
        </div>
      </ConditionalAuthProvider>
    );
  }

  // For admin pages, render without navbar/footer but with main-content padding
  if (isAdminPage) {
    return (
      <ConditionalAuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <main className="flex-grow-1 main-content">{children}</main>
        </div>
      </ConditionalAuthProvider>
    );
  }

  // For regular pages, render with navbar/footer and main-content padding
  return (
    <ConditionalAuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1 main-content">{children}</main>
      </div>
    </ConditionalAuthProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="description"
          content="Track the environmental impact of your purchases"
        />
        <title>H2All - Track Your Impact</title>
      </head>
      <body className={`${nunitoSans.variable} antialiased`}>
        <LayoutContent>{children}</LayoutContent>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
