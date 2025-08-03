"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RedemptionConfirmation from "../components/RedemptionConfirmation";
import { AuthProvider } from "../lib/auth-context";

function RedemptionContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaign") || "";
  const redemptionCode = searchParams.get("code") || "";

  if (!campaignId || !redemptionCode) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="alert alert-warning text-center">
              <h4>Invalid Redemption Link</h4>
              <p>This redemption link appears to be invalid or incomplete.</p>
              <p>Please check the link and try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <RedemptionConfirmation
            campaignId={campaignId}
            redemptionCode={redemptionCode}
          />
        </div>
      </div>
    </div>
  );
}

export default function RedeemPage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="text-center p-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading redemption details...</p>
          </div>
        }
      >
        <RedemptionContent />
      </Suspense>
    </AuthProvider>
  );
}
