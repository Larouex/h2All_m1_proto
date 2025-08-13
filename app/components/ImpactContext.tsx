"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ImpactData {
  claimedBottles: number;
  totalContribution: number;
  waterFunded: number;
  email?: string;
  lastClaimDate?: string;
  hasData?: boolean;
  totalRedeems?: number; // Include total redeems from the API
}

interface ImpactContextType {
  impactData: ImpactData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const ImpactContext = createContext<ImpactContextType | undefined>(undefined);

export function ImpactProvider({ children }: { children: React.ReactNode }) {
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImpactData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setImpactData({
          claimedBottles: 0,
          totalContribution: 0,
          waterFunded: 0,
          totalRedeems: 0,
        });
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append("email", userEmail);
      const apiUrl = `/api/user/email-impact?${params}`;

      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        setImpactData(data);
      } else if (response.status === 404) {
        setImpactData({
          claimedBottles: 0,
          totalContribution: 0,
          waterFunded: 0,
          totalRedeems: 0,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch impact data");
      }
    } catch (err) {
      console.error("Impact context error:", err);
      setError("Network error while fetching impact data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpactData();
  }, []);

  return (
    <ImpactContext.Provider
      value={{ impactData, loading, error, refetch: fetchImpactData }}
    >
      {children}
    </ImpactContext.Provider>
  );
}

export function useImpact() {
  const context = useContext(ImpactContext);
  if (context === undefined) {
    throw new Error("useImpact must be used within an ImpactProvider");
  }
  return context;
}
