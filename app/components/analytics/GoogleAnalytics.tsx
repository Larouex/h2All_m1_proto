"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function GoogleAnalytics() {
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  useEffect(() => {
    // Check if Google Analytics should be disabled via environment variable
    const isDisabled =
      process.env.NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS === "true";
    const isProduction = process.env.NODE_ENV === "production";

    // Only load analytics in production AND when not explicitly disabled
    setShouldLoadAnalytics(isProduction && !isDisabled);
  }, []);

  // Don't render anything during SSR, in development, or when disabled
  if (!shouldLoadAnalytics) return null;

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-JBMSHGTBMF"
        strategy="afterInteractive"
      />
      <Script id="ga-gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          gtag('js', new Date());
          gtag('config', 'G-JBMSHGTBMF');
        `}
      </Script>
    </>
  );
}
