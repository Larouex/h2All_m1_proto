"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function GoogleAnalytics() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Only set to true in production environment on client side
    setIsProduction(process.env.NODE_ENV === "production");
  }, []);

  // Don't render anything during SSR or in development
  if (!isProduction) return null;

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
