"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  AnalyticsContextType,
  DateRange,
  MetricData,
  CampaignData,
  RedemptionData,
  UserData,
  ProjectData,
  ExportOptions,
} from "@/types/analytics";

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });

  const [metrics, setMetrics] = useState<Record<string, MetricData>>({});
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch mock data for demonstration
  const fetchMockData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock metrics data
      const mockMetrics: Record<string, MetricData> = {
        totalCampaigns: {
          value: 24,
          change: 12.5,
          changeType: "positive",
          label: "Total Campaigns",
          icon: "bi-bullseye",
          color: "campaigns",
        },
        activeRedemptions: {
          value: 1847,
          change: -5.2,
          changeType: "negative",
          label: "Active Redemptions",
          icon: "bi-ticket-perforated",
          color: "redemptions",
        },
        fundingRaised: {
          value: 45230.5,
          change: 23.8,
          changeType: "positive",
          label: "Funding Raised",
          icon: "bi-currency-dollar",
          color: "funding",
        },
        totalUsers: {
          value: 3421,
          change: 8.7,
          changeType: "positive",
          label: "Total Users",
          icon: "bi-people",
          color: "users",
        },
      };

      // Mock campaigns data
      const mockCampaigns: CampaignData[] = [
        {
          id: "1",
          title: "Clean Water for Remote Villages",
          goal: 10000,
          raised: 7500.25,
          backers: 324,
          status: "active",
          createdAt: new Date("2024-01-15"),
          endDate: new Date("2025-03-15"),
        },
        {
          id: "2",
          title: "H2All Bottle Distribution Program",
          goal: 5000,
          raised: 5000,
          backers: 189,
          status: "completed",
          createdAt: new Date("2024-02-01"),
          endDate: new Date("2024-12-31"),
        },
        {
          id: "3",
          title: "Emergency Water Relief Fund",
          goal: 25000,
          raised: 12750.75,
          backers: 567,
          status: "active",
          createdAt: new Date("2024-03-10"),
          endDate: new Date("2025-06-30"),
        },
      ];

      // Mock redemptions data
      const mockRedemptions: RedemptionData[] = [];
      for (let i = 0; i < 50; i++) {
        mockRedemptions.push({
          id: `redemption-${i}`,
          userId: `user-${Math.floor(Math.random() * 100)}`,
          campaignId:
            mockCampaigns[Math.floor(Math.random() * mockCampaigns.length)].id,
          code: `H2ALL${String(Math.floor(Math.random() * 10000)).padStart(
            4,
            "0"
          )}`,
          redeemedAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          value: parseFloat((Math.random() * 50 + 10).toFixed(2)),
          status: ["active", "used", "expired"][
            Math.floor(Math.random() * 3)
          ] as "active" | "used" | "expired",
        });
      }

      // Mock users data
      const mockUsers: UserData[] = [];
      for (let i = 0; i < 100; i++) {
        mockUsers.push({
          id: `user-${i}`,
          email: `user${i}@example.com`,
          createdAt: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          ),
          lastActive: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ),
          totalContribution: parseFloat((Math.random() * 500 + 50).toFixed(2)),
          redemptionsCount: Math.floor(Math.random() * 10),
          campaignsSupported: Math.floor(Math.random() * 5) + 1,
        });
      }

      // Mock projects data
      const mockProjects: ProjectData[] = [
        {
          id: "project-1",
          name: "Kenya Water Well Project",
          description:
            "Building sustainable water wells in rural Kenya communities",
          status: "active",
          fundingGoal: 50000,
          fundingRaised: 32500,
          impactMetrics: {
            waterProvided: 125000,
            peopleHelped: 850,
            location: "Machakos County, Kenya",
          },
          createdAt: new Date("2024-01-01"),
        },
        {
          id: "project-2",
          name: "Amazon Rainforest Conservation",
          description: "Protecting water sources in the Amazon basin",
          status: "completed",
          fundingGoal: 30000,
          fundingRaised: 30000,
          impactMetrics: {
            waterProvided: 200000,
            peopleHelped: 1200,
            location: "Amazonas, Brazil",
          },
          createdAt: new Date("2023-06-01"),
          completedAt: new Date("2024-05-15"),
        },
      ];

      setMetrics(mockMetrics);
      setCampaigns(mockCampaigns);
      setRedemptions(mockRedemptions);
      setUsers(mockUsers);
      setProjects(mockProjects);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchMockData();
  }, [fetchMockData]);

  const exportData = useCallback(
    async (options: ExportOptions) => {
      try {
        // This would typically call an API endpoint to generate and download the export
        console.log("Exporting data with options:", options);

        // For demo purposes, create a simple CSV export
        if (options.format === "csv") {
          let csvContent = "";

          if (options.sections.includes("campaigns")) {
            csvContent += "Campaign Data\n";
            csvContent += "Title,Goal,Raised,Backers,Status,Created\n";
            campaigns.forEach((campaign) => {
              csvContent += `"${campaign.title}",${campaign.goal},${
                campaign.raised
              },${campaign.backers},${
                campaign.status
              },${campaign.createdAt.toISOString()}\n`;
            });
            csvContent += "\n";
          }

          if (options.sections.includes("users")) {
            csvContent += "User Data\n";
            csvContent +=
              "Email,Total Contribution,Redemptions Count,Campaigns Supported,Created\n";
            users.forEach((user) => {
              csvContent += `${user.email},${user.totalContribution},${
                user.redemptionsCount
              },${user.campaignsSupported},${user.createdAt.toISOString()}\n`;
            });
          }

          // Create and download the file
          const blob = new Blob([csvContent], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `h2all-analytics-${
            new Date().toISOString().split("T")[0]
          }.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } catch (err) {
        console.error("Export failed:", err);
        throw new Error("Failed to export data");
      }
    },
    [campaigns, users]
  );

  useEffect(() => {
    fetchMockData();
  }, [fetchMockData, dateRange]);

  const value: AnalyticsContextType = {
    dateRange,
    setDateRange,
    metrics,
    campaigns,
    redemptions,
    users,
    projects,
    loading,
    error,
    refreshData,
    exportData,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
