"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUIComponent = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="d-flex justify-content-center align-items-center loading-swagger">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading Swagger UI...</span>
      </div>
    </div>
  ),
});

interface SwaggerUIProps {
  url?: string;
  spec?: Record<string, unknown>;
}

export default function SwaggerUI({ url, spec }: SwaggerUIProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // More comprehensive warning suppression for swagger-ui-react
    if (process.env.NODE_ENV === "development") {
      // Store original console methods
      const originalWarn = console.warn;
      const originalError = console.error;

      // Override console.warn
      console.warn = (...args) => {
        const message = String(args[0] || "");
        if (
          message.includes("UNSAFE_componentWillReceiveProps") ||
          message.includes("UNSAFE_componentWillMount") ||
          message.includes("UNSAFE_componentWillUpdate") ||
          message.includes("ModelCollapse") ||
          message.includes("OperationContainer") ||
          message.includes("componentWillReceiveProps") ||
          message.includes("react-dev-tools") ||
          message.includes("strict mode")
        ) {
          // Suppress these warnings
          return;
        }
        originalWarn.apply(console, args);
      };

      // Override console.error for React warnings
      console.error = (...args) => {
        const message = String(args[0] || "");
        if (
          message.includes("UNSAFE_componentWillReceiveProps") ||
          message.includes("componentWillReceiveProps") ||
          message.includes("ModelCollapse") ||
          message.includes("OperationContainer")
        ) {
          // Suppress these errors
          return;
        }
        originalError.apply(console, args);
      };

      // Also suppress React warnings at the window level
      const originalWindowError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        if (
          typeof message === "string" &&
          (message.includes("UNSAFE_componentWillReceiveProps") ||
            message.includes("ModelCollapse") ||
            message.includes("OperationContainer"))
        ) {
          return true; // Prevent default error handling
        }
        return originalWindowError
          ? originalWindowError(message, source, lineno, colno, error)
          : false;
      };

      return () => {
        console.warn = originalWarn;
        console.error = originalError;
        window.onerror = originalWindowError;
      };
    }
  }, []);

  if (!mounted) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-swagger">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Swagger UI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="swagger-ui-container">
      <SwaggerUIComponent
        url={url}
        spec={spec}
        deepLinking={true}
        displayOperationId={false}
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
        docExpansion="list"
        filter={true}
        layout="BaseLayout"
        persistAuthorization={true}
        showExtensions={false}
        showCommonExtensions={false}
        tryItOutEnabled={true}
        onComplete={() => {
          // Swagger UI has loaded
          console.log("📚 Swagger UI loaded successfully");
        }}
      />
      <style jsx global>{`
        .loading-swagger {
          min-height: 400px;
        }

        .swagger-ui-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .swagger-ui .topbar {
          display: none;
        }

        .swagger-ui .info {
          margin: 20px 0;
        }

        .swagger-ui .scheme-container {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
        }

        .swagger-ui .btn.authorize {
          background: #0d6efd;
          border-color: #0d6efd;
        }

        .swagger-ui .btn.authorize:hover {
          background: #0b5ed7;
          border-color: #0a58ca;
        }

        .swagger-ui .opblock.opblock-post {
          border-color: #198754;
          background: rgba(25, 135, 84, 0.1);
        }

        .swagger-ui .opblock.opblock-get {
          border-color: #0d6efd;
          background: rgba(13, 110, 253, 0.1);
        }

        .swagger-ui .opblock.opblock-put {
          border-color: #fd7e14;
          background: rgba(253, 126, 20, 0.1);
        }

        .swagger-ui .opblock.opblock-delete {
          border-color: #dc3545;
          background: rgba(220, 53, 69, 0.1);
        }

        .swagger-ui .execute-wrapper {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 4px;
          margin: 10px 0;
        }

        .swagger-ui .responses-wrapper {
          margin-top: 20px;
        }

        .swagger-ui .response .response-col_status {
          font-weight: bold;
        }

        .swagger-ui .response .response-col_description {
          padding-left: 10px;
        }

        .swagger-ui .btn.try-out__btn {
          background: #198754;
          border-color: #198754;
          color: white;
        }

        .swagger-ui .btn.try-out__btn:hover {
          background: #157347;
          border-color: #146c43;
        }

        .swagger-ui .btn.execute {
          background: #0d6efd;
          border-color: #0d6efd;
        }

        .swagger-ui .btn.execute:hover {
          background: #0b5ed7;
          border-color: #0a58ca;
        }
      `}</style>
    </div>
  );
}
