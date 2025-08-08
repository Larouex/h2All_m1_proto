"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new admin analytics path
    router.replace("/admin/analytics");
  }, [router]);

  return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Redirecting...</span>
      </div>
      <p>Redirecting to admin analytics...</p>
    </div>
  );
}
