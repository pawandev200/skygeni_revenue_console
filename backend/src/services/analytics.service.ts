import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import isBetween from "dayjs/plugin/isBetween";

import {
  Deal,
  Target,
  Rep,
  Activity,
  Account,
  MetricWithTrend,
  MonthlyRevenueTrend,
} from "../types";

dayjs.extend(quarterOfYear);
dayjs.extend(isBetween);

// CONFIG:

const STALE_DAYS = 30;
const LOW_ACTIVITY_DAYS = 30;
const HIGH_VALUE_THRESHOLD = 50000;
const MIN_REP_DEALS = 5;

// HELPERS function: 

function buildMap<T, K extends keyof T>(
  items: T[],
  key: K
): Map<T[K], T> {
  return new Map(items.map((item) => [item[key], item]));
}

function sumAmounts(deals: Deal[]) {
  return deals.reduce((sum, d) => sum + (d.amount ?? 0), 0);
}

function calculateMetricWithTrend(
  current: number,
  previous: number,
  trend: number[]
): MetricWithTrend {
  const change = current - previous;
  const changePercentage = previous !== 0 ? (change / previous) * 100 : 0;

  return {
    value: current,
    change,
    changePercentage,
    trend,
  };
}

function getReferenceDate(targets: Target[]) {
  return targets
    .map((t) => dayjs(t.month))
    .sort((a, b) => b.valueOf() - a.valueOf())[0];
}

// SUMMARY:

export function getCurrentQuarterRevenue(deals: Deal[], targets: Target[]) {
  const refDate = getReferenceDate(targets);
  const start = refDate.startOf("quarter");
  const end = refDate.endOf("quarter");

  const closedDeals = deals.filter((d) => {
    if (!d.closed_at) return false; 
    
    return (
      d.stage === "Closed Won" &&
      d.amount != null &&
      dayjs(d.closed_at).isBetween(start, end, null, "[]")
    );
  });

  return sumAmounts(closedDeals);
}

export function getQuarterTarget(targets: Target[]) {
  const refDate = getReferenceDate(targets);
  const quarter = refDate.quarter();
  const year = refDate.year();

  return targets
    .filter((t) => {
      const date = dayjs(t.month);
      return date.quarter() === quarter && date.year() === year;
    })
    .reduce((sum, t) => sum + t.target, 0);
}

export function getQoQChange(deals: Deal[], targets: Target[]) {
  const refDate = getReferenceDate(targets);

  const currentStart = refDate.startOf("quarter");
  const currentEnd = refDate.endOf("quarter");

  const prevStart = refDate.subtract(1, "quarter").startOf("quarter");
  const prevEnd = refDate.subtract(1, "quarter").endOf("quarter");

  const currentRevenue = sumAmounts(
    deals.filter(
      (d) =>
        d.stage === "Closed Won" &&
        d.amount != null &&
        d.closed_at &&
        dayjs(d.closed_at).isBetween(currentStart, currentEnd, null, "[]")
    )
  );

  const prevRevenue = sumAmounts(
    deals.filter(
      (d) =>
        d.stage === "Closed Won" &&
        d.amount != null &&
        d.closed_at &&
        dayjs(d.closed_at).isBetween(prevStart, prevEnd, null, "[]")
    )
  );

  return prevRevenue ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
}

/* ================= MONTH GROUPING (Performance Boost) ================= */

function groupDealsByMonth(
  deals: Deal[],
  field: "created_at" | "closed_at"
) {
  const map = new Map<string, Deal[]>();

  deals.forEach((d) => {
    const date = d[field];
    if (!date) return;

    const key = dayjs(date).format("YYYY-MM");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(d);
  });

  return map;
}

// DRIVERS:

export function calculateWinRate(deals: Deal[]) {
  const closed = deals.filter(
    (d) => d.stage === "Closed Won" || d.stage === "Closed Lost"
  );
  const won = closed.filter((d) => d.stage === "Closed Won" && d.amount != null);

  return closed.length ? won.length / closed.length : 0;
}

export function getUnderperformingReps(
  deals: Deal[],
  reps: Rep[]
) {
  const repStats = reps.map((rep) => {
    const repDeals = deals.filter(
      (d) => d.rep_id === rep.rep_id
    );

    const closedDeals = repDeals.filter(
      (d) =>
        d.stage === "Closed Won" ||
        d.stage === "Closed Lost"
    );

    const winRate = calculateWinRate(repDeals) * 100;

    return {
      repId: rep.rep_id,
      repName: rep.name,
      winRate,
      dealsWorked: closedDeals.length,
    };
  });

  const valid = repStats.filter(
    (r) => r.dealsWorked >= MIN_REP_DEALS
  );

  const avgWinRate =
    valid.length > 0
      ? valid.reduce((sum, r) => sum + r.winRate, 0) /
        valid.length
      : 0;

  return valid
    .filter((r) => r.winRate < avgWinRate)
    .sort((a, b) => a.winRate - b.winRate)
    .slice(0, 5);
}

export function getLowActivityAccounts(
  deals: Deal[],
  activities: Activity[],
  accounts: Account[]
) {
  const now = dayjs();

  const recentActivities = activities.filter((a) =>
    now.diff(dayjs(a.timestamp), "day") <
    LOW_ACTIVITY_DAYS
  );

  const activeDealIds = new Set(
    recentActivities.map((a) => a.deal_id)
  );

  const openDeals = deals.filter(
    (d) =>
      d.stage !== "Closed Won" &&
      d.stage !== "Closed Lost" &&
      !activeDealIds.has(d.deal_id)
  );

  const grouped = new Map<string, Deal[]>();

  openDeals.forEach((d) => {
    const existing = grouped.get(d.account_id) ?? [];
    grouped.set(d.account_id, [...existing, d]);
  });

  return Array.from(grouped.entries())
    .map(([accountId, deals]) => {
      const account = accounts.find(
        (a) => a.account_id === accountId
      );

      const totalValue = deals.reduce(
        (sum, d) => sum + (d.amount ?? 0),
        0
      );

      return {
        accountId,
        accountName: account?.name ?? "Unknown",
        segment: account?.segment ?? "Unknown",
        openDeals: deals.length,
        totalValue,
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 15);
}


export function getRevenueDrivers(deals: Deal[], targets: Target[]) {
  const refDate = getReferenceDate(targets);

  const createdMap = groupDealsByMonth(deals, "created_at");
  const closedMap = groupDealsByMonth(deals, "closed_at");

  const getMonthKey = (offset: number) => refDate.subtract(offset, "month").format("YYYY-MM");

  const pipelineTrend: number[] = [];
  const winRateTrend: number[] = [];
  const avgDealTrend: number[] = [];
  const cycleTrend: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const createdDeals = createdMap.get(getMonthKey(i)) ?? [];
    const closedDeals = closedMap.get(getMonthKey(i)) ?? [];

    pipelineTrend.push(
      sumAmounts( createdDeals.filter(
          (d) =>
            d.stage !== "Closed Won" &&
            d.stage !== "Closed Lost" &&
            d.amount != null
        )
      )
    );

    const closedValid = closedDeals.filter(
      (d) => d.stage === "Closed Won" || d.stage === "Closed Lost"
    );

    const wonDeals = closedDeals.filter(
      (d) => d.stage === "Closed Won" && d.amount != null
    );

    winRateTrend.push(
      closedValid.length ? (wonDeals.length / closedValid.length) * 100 : 0
    );

    avgDealTrend.push(
      wonDeals.length ? sumAmounts(wonDeals) / wonDeals.length : 0
    );

    const totalCycle = wonDeals.reduce(
      (sum, d) =>
        sum + dayjs(d.closed_at).diff(dayjs(d.created_at), "day"),
      0
    );

    cycleTrend.push(
      wonDeals.length ? totalCycle / wonDeals.length : 0
    );
  }
  
  const currentKey = getMonthKey(0);
  const prevKey = getMonthKey(1);

  // month-over-month comparison.
  return {
    pipelineSize: calculateMetricWithTrend(
      pipelineTrend[5], // current month
      pipelineTrend[4], // previous month
      pipelineTrend
    ),
    winRate: calculateMetricWithTrend(
      winRateTrend[5],
      winRateTrend[4],
      winRateTrend
    ),
    averageDealSize: calculateMetricWithTrend(
      avgDealTrend[5],
      avgDealTrend[4],
      avgDealTrend
    ),
    salesCycleTime: calculateMetricWithTrend(
      cycleTrend[5],
      cycleTrend[4],
      cycleTrend
    ),
  };
}

// RECOMMENDATIONS:

export function getStaleDeals(
  deals: Deal[],
  accounts: Account[],
  reps: Rep[],
  targets: Target[]
) {
  const refDate = getReferenceDate(targets);
  const accountMap = buildMap(accounts, "account_id");
  const repMap = buildMap(reps, "rep_id");

  return deals
    .filter(
      (d) =>
        d.stage !== "Closed Won" &&
        d.stage !== "Closed Lost" &&
        d.amount != null &&
        d.created_at &&
        refDate.diff(dayjs(d.created_at), "day") > STALE_DAYS
    )
    .map((d) => ({
      dealId: d.deal_id,
      accountName: accountMap.get(d.account_id)?.name ?? "Unknown",
      segment: accountMap.get(d.account_id)?.segment ?? "Unknown",
      repName: repMap.get(d.rep_id)?.name ?? "Unknown",
      value: d.amount ?? 0,
      daysStale: refDate.diff(dayjs(d.created_at), "day"),
    }))
    .filter(
      (d) => d.segment === "Enterprise" || d.value > HIGH_VALUE_THRESHOLD
    )
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

// TREND:

export function getRevenueTrendLast6Months(
  deals: Deal[],
  targets: Target[]
): MonthlyRevenueTrend[] {
  const refDate = getReferenceDate(targets);
  const closedMap = groupDealsByMonth(deals, "closed_at");

  const results: MonthlyRevenueTrend[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = refDate.subtract(i, "month");
    const key = date.format("YYYY-MM");

    const monthlyDeals = closedMap.get(key) ?? [];

    const revenue = sumAmounts(
      monthlyDeals.filter((d) => {
        if (!d.closed_at) return false; // safety check
        return d.stage === "Closed Won" && d.amount != null;
      })
    );

    const target = targets.find((t) => t.month === key)?.target ?? 0;

    results.push({
      month: date.format("MMM"),
      revenue,
      target,
      achieved: target ? (revenue / target) * 100 : 0,
    });
  }

  return results;
}