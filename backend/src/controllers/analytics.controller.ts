import { Request, Response } from "express";
import { loadJSON } from "../utils/dataLoader";
import * as service from "../services/analytics.service";
import {
  Deal,
  Target,
  Rep,
  Activity,
  Account,
} from "../types";

/* ================= CONFIG ================= */

const RECOVERY_RATE = 0.3;
const INDUSTRY_WIN_RATE_MIN = 25;
const MAX_RECOMMENDATIONS = 5;

/* ================= TYPES ================= */

interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: "deals" | "reps" | "accounts" | "strategy";
  title: string;
  description: string;
  impact: string;
  action: string;
}

/* ================= IN-MEMORY DATA CACHE ================= */

const db = {
  deals: loadJSON<Deal>("deals.json"),
  targets: loadJSON<Target>("targets.json"),
  reps: loadJSON<Rep>("reps.json"),
  activities: loadJSON<Activity>("activities.json"),
  accounts: loadJSON<Account>("accounts.json"),
};

/* ================= HELPERS ================= */

function round(value: number, precision = 1) {
  return Number(value.toFixed(precision));
}

function roundMetric(metric: any, precision = 1) {
  return {
    ...metric,
    value: round(metric.value, precision),
    change: round(metric.change, precision),
    changePercentage: round(metric.changePercentage, 1),
    trend: metric.trend.map((v: number) =>
      round(v, precision)
    ),
  };
}

/* ================= SUMMARY ================= */

export function getSummary(req: Request, res: Response) {
  try {
    const revenue = service.getCurrentQuarterRevenue(db.deals, db.targets);
    const target = service.getQuarterTarget(db.targets);
    const qoq = service.getQoQChange(db.deals, db.targets);

    const gap = revenue - target;
    const gapPercentage = target ? (gap / target) * 100 : 0;

    res.json({
      currentQuarterRevenue: Math.round(revenue),
      target: Math.round(target),
      gap: Math.round(gap),
      gapPercentage: round(gapPercentage, 1),
      qoqChange: round(qoq, 1),
    });
  } catch (err) {
    console.error("Error in getSummary:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/* ================= DRIVERS ================= */

export function getDrivers(req: Request, res: Response) {
  try {
    const drivers = service.getRevenueDrivers(db.deals, db.targets);

    const formatted = {
      pipelineSize: roundMetric(drivers.pipelineSize, 0),
      winRate: roundMetric(drivers.winRate, 1),
      averageDealSize: roundMetric(drivers.averageDealSize, 0),
      salesCycleTime: roundMetric(drivers.salesCycleTime, 0),
    };

    res.json(formatted);
  } catch (err) {
    console.error("Error in getDrivers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/* ================= RISK ================= */

export function getRiskFactors(req: Request, res: Response) {
  try {
    res.json({
      staleDeals: service.getStaleDeals(
        db.deals,
        db.accounts,
        db.reps,
        db.targets
      ),
      underperformingReps: service.getUnderperformingReps(
        db.deals,
        db.reps
      ),
      lowActivityAccounts:
        service.getLowActivityAccounts(
          db.deals,
          db.activities,
          db.accounts,
          db.reps,
          db.targets
        ),
    });
  } catch (err) {
    console.error("Error in getRiskFactors:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/* ================= RECOMMENDATIONS ================= */

export function getRecommendations(
  req: Request,
  res: Response
) {
  try {
    const stale = service.getStaleDeals(
      db.deals,
      db.accounts,
      db.reps,
      db.targets
    );

    const underperformers =
      service.getUnderperformingReps(db.deals, db.reps);

    const lowActivity =
      service.getLowActivityAccounts(
        db.deals,
        db.activities,
        db.accounts,
        db.reps,
        db.targets
      );

    const recommendations: Recommendation[] = [];

    /* ----- STALE DEALS ----- */
    if (stale.length > 0) {
      const totalValue = stale.reduce(
        (sum, d) => sum + d.value,
        0
      );

      const recoverable = totalValue * RECOVERY_RATE;

      recommendations.push({
        id: "rec-1",
        priority: "high",
        category: "deals",
        title: "Focus on aging Enterprise deals",
        description: `${stale.length} high-value deals worth $${(
          totalValue / 1_000_000
        ).toFixed(1)}M have been inactive.`,
        impact: `Recovering ${Math.round(
          RECOVERY_RATE * 100
        )}% could unlock ~$${(
          recoverable / 1_000_000
        ).toFixed(1)}M`,
        action:
          "Schedule executive sponsor reviews for top 5 deals",
      });
    }

    /* ----- UNDERPERFORMING REPS ----- */
    if (underperformers.length > 0) {
      const rep = underperformers[0];

      recommendations.push({
        id: "rec-2",
        priority: "high",
        category: "reps",
        title: `Coach ${rep.repName} on deal qualification`,
        description: `${rep.repName} has a ${rep.winRate.toFixed(
          0
        )}% win rate vs team average.`,
        impact:
          "Improving to team average could increase quarterly revenue",
        action:
          "Implement structured deal review sessions",
      });
    }

    /* ----- LOW ACTIVITY ACCOUNTS ----- */
    if (lowActivity.length > 0) {
      const totalValue = lowActivity.reduce(
        (sum, a) => sum + a.totalValue,
        0
      );

      recommendations.push({
        id: "rec-3",
        priority: "medium",
        category: "accounts",
        title: "Re-engage inactive pipeline accounts",
        description: `${lowActivity.length} accounts with $${(
          totalValue / 1_000_000
        ).toFixed(1)}M in pipeline show low activity.`,
        impact:
          "Re-engagement may reduce pipeline slippage risk",
        action:
          "Launch targeted re-engagement outreach campaign",
      });
    }

    /* ----- STRATEGY LEVEL ----- */
    const winRate =
      service.getWinRate(db.deals) * 100;

    if (winRate < INDUSTRY_WIN_RATE_MIN) {
      recommendations.push({
        id: "rec-4",
        priority: "high",
        category: "strategy",
        title: "Improve overall win rate",
        description: `Current win rate ${winRate.toFixed(
          1
        )}% is below industry benchmark (${INDUSTRY_WIN_RATE_MIN}%).`,
        impact:
          "Higher qualification discipline could improve conversion",
        action:
          "Adopt structured qualification framework (e.g., MEDDIC)",
      });
    }

    res.json({
      recommendations: recommendations.slice(
        0,
        MAX_RECOMMENDATIONS
      ),
    });
  } catch (err) {
    console.error("Error in getRecommendations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/* ================= TREND ================= */

export function getTrendLast6Months(
  req: Request,
  res: Response
) {
  try {
    const trend =
      service.getRevenueTrendLast6Months(
        db.deals,
        db.targets
      );

    res.json({
      months: trend.map((m) => ({
        ...m,
        revenue: Math.round(m.revenue),
        target: Math.round(m.target),
        achieved: round(m.achieved, 1),
      })),
    });
  } catch (err) {
    console.error(
      "Error in getTrendLast6Months:",
      err
    );
    res.status(500).json({ error: "Internal server error" });
  }
}
