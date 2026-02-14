export interface Summary {
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

export interface RevenueDrivers {
  pipelineSize: MetricWithTrend;
  winRate: MetricWithTrend;
  averageDealSize: MetricWithTrend;
  salesCycleTime: MetricWithTrend;
}

// export interface RiskFactors {
//   staleDeals: any[];
//   underperformingReps: { rep: string; winRate: number }[];
//   lowActivityAccounts: any[];
// }
export interface RiskFactors {
  staleDeals: {
    dealId: string;
    accountName: string;
    segment: string;
    repName: string;
    value: number;
    daysStale: number;
  }[];
  underperformingReps: {
    repId: string;
    repName: string;
    winRate: number;
    dealsWorked: number;
  }[];
  lowActivityAccounts: {
    accountId: string;
    accountName: string;
    segment: string;
    repName: string;
    openDeals: number;
    totalValue: number;
  }[];
}


export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  impact: string;
  action: string;
}

export interface RevenueTrendMonth {
  month: string;
  revenue: number;
  target: number;
  achieved: number;
}
