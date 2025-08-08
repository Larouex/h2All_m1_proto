"use client";

import Script from "next/script";

// Only render GA in production
const isProd = process.env.NODE_ENV === "production";

export default function GoogleAnalytics() {
  if (!isProd) return null;

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
