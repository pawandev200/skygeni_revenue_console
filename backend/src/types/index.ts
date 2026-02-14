export interface Account {
  account_id: string;
  name: string;
  industry: string;
  segment: string;
}

export interface Deal {
  deal_id: string;
  account_id: string;
  rep_id: string;
  stage: string;
  amount: number | null;
  created_at: string;
  closed_at: string | null;
}

export interface Rep {
  rep_id: string;
  name: string;
}

export interface Target {
  month: string; // "2025-01"
  target: number;
}

export interface Activity {
  activity_id: string;
  deal_id: string;
  type: string;
  timestamp: string;
}

/* -------- FRONTEND RESPONSE TYPES -------- */

export interface SummaryResponse {
  currentQuarterRevenue: number;
  target: number;
  gap: number;
  gapPercentage: number;
  qoqChange: number;
}

export interface MetricWithTrend {
  value: number;
  change: number;
  changePercentage: number;
  trend: number[];
}

export interface RevenueDriversResponse { // RevenueDrivers
  pipelineSize: MetricWithTrend;
  winRate: MetricWithTrend;
  averageDealSize: MetricWithTrend;
  salesCycleTime: MetricWithTrend;
}


export interface MonthlyRevenueTrend {
  month: string; // Display name like "Oct", "Nov"
  revenue: number; // Actual revenue
  target: number; // Target for the month
  achieved: number; // Percentage achieved (revenue/target * 100)
}