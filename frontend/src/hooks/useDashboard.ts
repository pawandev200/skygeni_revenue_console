import { useEffect, useState } from "react";
import {
  fetchSummary,
  fetchDrivers,
  fetchRiskFactors,
  fetchRecommendations,
  fetchTrend
} from "../api/dashboardApi";

import type {
  Summary,
  RevenueDrivers,
  RiskFactors,
  Recommendation,
  RevenueTrendMonth
} from "../types";

export function useDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [drivers, setDrivers] = useState<RevenueDrivers | null>(null);
  const [risks, setRisks] = useState<RiskFactors | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trend, setTrend] = useState<RevenueTrendMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, d, r, rec, t] = await Promise.all([
          fetchSummary(),
          fetchDrivers(),
          fetchRiskFactors(),
          fetchRecommendations(),
          fetchTrend()
        ]);

        setSummary(s);
        setDrivers(d);
        setRisks(r);
        setRecommendations(rec?? []);
        setTrend(t?? []);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { summary, drivers, risks, recommendations, trend, loading };
}
