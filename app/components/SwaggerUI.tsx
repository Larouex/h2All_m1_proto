"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Simple dynamic import without complex styling
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <div>Loading API Documentation...</div>,
});

interface SwaggerUIProps {
  url?: string;
  spec?: Record<string, unknown>;
}

export default function SimpleSwaggerUI({ url, spec }: SwaggerUIProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load basic swagger CSS
    if (!document.querySelector('link[href*="swagger-ui.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css";
      document.head.appendChild(link);
    }

    // Add CSS to fix span width issues
    if (!document.querySelector("#swagger-fix-css")) {
      const style = document.createElement("style");
      style.id = "swagger-fix-css";
      style.textContent = `
        .swagger-ui .opblock-summary-path,
        .swagger-ui .opblock-summary-description,
        .swagger-ui .opblock-summary span {
          width: auto !important;
          min-width: none !important;
          max-width: none !important;
          white-space: nowrap !important;
          overflow: visible !important;
          text-overflow: clip !important;
        }
        .swagger-ui .opblock-summary {
          flex-wrap: nowrap !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!mounted) {
    return <div>Loading API Documentation...</div>;
  }

  return (
    <div className="swagger-container">
      <SwaggerUI
        url={url}
        spec={spec}
        docExpansion="list"
        deepLinking={true}
        tryItOutEnabled={true}
      />
      <style jsx global>{`
        .swagger-container {
          width: 100%;
        }

        /* Fix for vertical text in API names */
        .swagger-ui .opblock-summary-path,
        .swagger-ui .opblock-summary-description,
        .swagger-ui .opblock-summary span {
          width: auto !important;
          min-width: auto !important;
          max-width: none !important;
          white-space: nowrap !important;
          overflow: visible !important;
          text-overflow: clip !important;
          display: inline !important;
        }

        .swagger-ui .opblock-summary {
          flex-wrap: nowrap !important;
          align-items: center !important;
        }

        .swagger-ui .opblock-summary-path {
          font-family: monospace !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
}
