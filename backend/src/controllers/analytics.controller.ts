import { Request, Response } from "express";
import { loadJSON } from "../utils/dataLoader";
import * as service from "../services/analytics.service";
import {
  Deal,
  Target,
  Rep,
  Activity,
  Account,
  Recommendation,
} from "../types";


// CONFIG:
const RECOVERY_RATE = 0.3;
const INDUSTRY_WIN_RATE_MIN = 25;
const MAX_RECOMMENDATIONS = 5;


// IN-MEMORY CACHE
const db = {
  deals: loadJSON<Deal>("deals.json"),
  targets: loadJSON<Target>("targets.json"),
  reps: loadJSON<Rep>("reps.json"),
  activities: loadJSON<Activity>("activities.json"),
  accounts: loadJSON<Account>("accounts.json"),
};


// HELPERS function: 
function round(value: number, precision = 1) {
  return Number(value.toFixed(precision));
}

// SUMMARY:

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
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DRIVERS:

export function getDrivers(req: Request, res: Response) {
  try {
    const drivers = service.getRevenueDrivers(db.deals, db.targets);

    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// RISK:

export function getRiskFactors(req: Request, res: Response) {
  try {
    res.json({
      staleDeals: service.getStaleDeals( db.deals, db.accounts, db.reps, db.targets ),
      underperformingReps: service.getUnderperformingReps(db.deals, db.reps),
      lowActivityAccounts: service.getLowActivityAccounts(db.deals, db.activities, db.accounts),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// RECOMMENDATIONS:

export function getRecommendations(req: Request, res: Response) {
  try {
    const stale = service.getStaleDeals(db.deals, db.accounts, db.reps, db.targets);

    const underperformers = service.getUnderperformingReps(db.deals, db.reps);
    const lowActivity = service.getLowActivityAccounts(db.deals, db.activities, db.accounts);
    const winRate = service.calculateWinRate(db.deals) * 100;
    // console.log(`Overall Win Rate: ${winRate.toFixed(1)}%`);

    const recommendations: Recommendation[] = [];

    if (stale.length > 0) {
      const totalValue = stale.reduce((sum, d) => sum + d.value, 0);
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
          "Schedule executive sponsor reviews for top deals",
      });
    }

    if (underperformers.length > 0) { 
      const rep = underperformers[0]; 
      recommendations.push({ id: "rec-2", priority: "high", category: "reps", title: `Coach ${rep.repName} on deal qualification`, description: `${rep.repName} has a ${rep.winRate.toFixed( 1 )}% win rate vs team average.`, impact: "Improving to team average could increase quarterly revenue", action: "Implement structured deal review sessions", }); 
    }

    if (lowActivity.length > 0) { 
      const totalValue = lowActivity.reduce( (sum, a) => sum + a.totalValue, 0 ); 
      recommendations.push({ id: "rec-3", priority: "medium", category: "accounts", title: "Re-engage inactive pipeline accounts", description: `${lowActivity.length} accounts with $${( totalValue / 1_000_000 ).toFixed(1)}M in pipeline show low activity.`, impact: "Re-engagement may reduce pipeline slippage risk", action: "Launch targeted re-engagement outreach campaign", }); 
    }

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
      recommendations: recommendations.slice( 0, MAX_RECOMMENDATIONS )
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// TREND:

export function getTrendLast6Months( req: Request, res: Response ) {
  try {
    const trend = service.getRevenueTrendLast6Months( db.deals, db.targets );

    res.json({ months: trend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
