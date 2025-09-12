"use client";

import { useState, useEffect } from "react";
import styles from "./Metrics.module.css";

interface EmailClaim {
  id: number;
  email: string;
  created_at: string;
  claim_count?: number;
  updated_at: string;
  status?: string;
}

interface MetricsData {
  totalClaims: number;
  totalClaimCount: number;
  recentClaims: EmailClaim[];
  dailyClaims: { date: string; count: number }[];
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "claims" | "email">("recent");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/metrics", {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_METRICS_API_KEY || "SkyBlueSkyWilco2433",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const sortedClaims = metrics?.recentClaims
    ?.filter((claim) =>
      searchTerm ? claim.email.toLowerCase().includes(searchTerm.toLowerCase()) : true
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "claims":
          return (b.claim_count || 0) - (a.claim_count || 0);
        case "email":
          return a.email.localeCompare(b.email);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Email Claims Metrics Dashboard</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Email Claims</h3>
          <p className={styles.statNumber}>{metrics?.totalClaims || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Claim Count</h3>
          <p className={styles.statNumber}>{metrics?.totalClaimCount || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Today&apos;s Claims</h3>
          <p className={styles.statNumber}>
            {metrics?.dailyClaims?.find(
              (d) => d.date === new Date().toISOString().split("T")[0]
            )?.count || 0}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Average Claims/Email</h3>
          <p className={styles.statNumber}>
            {metrics?.totalClaims 
              ? (metrics.totalClaimCount / metrics.totalClaims).toFixed(1)
              : 0}
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "recent" | "claims" | "email")}
          className={styles.sortSelect}
        >
          <option value="recent">Sort by Recent</option>
          <option value="claims">Sort by Claim Count</option>
          <option value="email">Sort by Email</option>
        </select>
        <button onClick={fetchMetrics} className={styles.refreshButton}>
          Refresh
        </button>
      </div>

      <div className={styles.tableContainer}>
        <h2>Recent Claims (Sorted by Last Updated)</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Claim Count</th>
              <th>Created At</th>
              <th>Last Updated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedClaims?.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.email}</td>
                <td>{claim.claim_count || 1}</td>
                <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                <td>{new Date(claim.updated_at).toLocaleDateString()}</td>
                <td>{claim.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.chartContainer}>
        <h2>Daily Claims (Last 7 Days)</h2>
        <div className={styles.barChart}>
          {metrics?.dailyClaims?.map((day) => {
            const maxCount = Math.max(...(metrics?.dailyClaims?.map(d => d.count) || [1]), 1);
            const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            
            return (
              <div key={day.date} className={styles.barWrapper}>
                <div 
                  className={styles.bar} 
                  style={{ 
                    height: `${Math.max(heightPercent, 5)}%`,
                    minHeight: '20px'
                  }}
                >
                  <span className={styles.barLabel}>{day.count}</span>
                </div>
                <span className={styles.barDate}>
                  {new Date(day.date + 'T00:00:00').toLocaleDateString("en", { month: "short", day: "numeric" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}