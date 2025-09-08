"use client";

import { usePathname } from "next/navigation";
import GoogleAnalytics from "./GoogleAnalytics";

export default function ConditionalGoogleAnalytics() {
  const pathname = usePathname();
  
  // Check if we're on the redeem subdomain
  const isRedeemSubdomain = typeof window !== "undefined" && 
    window.location.hostname === "redeem.h2all.com";
  
  // List of pages that should NOT have Google Analytics
  const excludedPages = ["/claim", "/emailclaim"];
  
  // Don't load Google Analytics if:
  // 1. We're on the redeem subdomain, OR
  // 2. We're on an excluded page
  const shouldExcludeAnalytics = isRedeemSubdomain || excludedPages.includes(pathname);
  
  // Only render Google Analytics if we should NOT exclude it
  if (shouldExcludeAnalytics) {
    return null;
  }
  
  return <GoogleAnalytics />;
}