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
      <style jsx>{`
        .swagger-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
