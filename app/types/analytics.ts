export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface MetricData {
  value: number;
  change: number;
  changeType: "positive" | "negative" | "neutral";
  label: string;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: string | number | boolean;
}

export interface CampaignData {
  id: string;
  title: string;
  goal: number;
  raised: number;
  backers: number;
  status: "active" | "completed" | "draft";
  createdAt: Date;
  endDate?: Date;
}

export interface RedemptionData {
  id: string;
  userId: string;
  campaignId: string;
  code: string;
  redeemedAt: Date;
  value: number;
  status: "active" | "used" | "expired";
}

export interface UserData {
  id: string;
  email: string;
  createdAt: Date;
  lastActive: Date;
  totalContribution: number;
  redemptionsCount: number;
  campaignsSupported: number;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "planned";
  fundingGoal: number;
  fundingRaised: number;
  impactMetrics: {
    waterProvided: number;
    peopleHelped: number;
    location: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface WidgetConfig {
  id: string;
  type: "chart" | "table" | "metric" | "map";
  title: string;
  size: "small" | "medium" | "large";
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, string | number | boolean | object>;
}

export interface DashboardLayout {
  [section: string]: WidgetConfig[];
}

export interface ExportOptions {
  format: "csv" | "xlsx" | "pdf" | "png";
  includeCharts: boolean;
  dateRange: DateRange;
  sections: string[];
}

export interface AnalyticsContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  metrics: Record<string, MetricData>;
  campaigns: CampaignData[];
  redemptions: RedemptionData[];
  users: UserData[];
  projects: ProjectData[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  exportData: (options: ExportOptions) => Promise<void>;
}

export interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export interface SidebarSection {
  id: string;
  label: string;
  icon: string;
  path: string;
  subsections?: SidebarSection[];
}

export interface ChartConfig {
  type: "line" | "bar" | "pie" | "area" | "donut";
  dataKey: string;
  xAxisKey?: string;
  yAxisKey?: string;
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  responsive: boolean;
}

export interface TableConfig {
  columns: TableColumn[];
  sortable: boolean;
  filterable: boolean;
  paginated: boolean;
  pageSize: number;
}

export interface TableColumn {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "currency" | "status";
  sortable: boolean;
  filterable: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  format?: (value: string | number | Date) => string;
}
