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

// Drivers: Revenue trend → correct to use closed_at, Pipeline & win-rate monthly trends → created_at may be fine


/* CONFIG: */

const STALE_DAYS = 30;
const LOW_ACTIVITY_DAYS = 30;
const HIGH_VALUE_THRESHOLD = 50000;
const MIN_REP_DEALS = 5;

/*Helper function: */

function buildMap<T extends { [key: string]: any }>(
  items: T[],
  key: keyof T
): Map<any, T> {
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

// find the last valid month in your targets
function getReferenceDate(targets: Target[]) {
  const latestTarget = targets
    .map(t => dayjs(t.month))
    .sort((a, b) => b.valueOf() - a.valueOf())[0];
  return latestTarget || dayjs();
}

/* SUMMARY */

export function getCurrentQuarterRevenue(deals: Deal[], targets: Target[]) {
  // const now = dayjs();
  // const start = now.startOf("quarter");
  // const end = now.endOf("quarter");
  const refDate = getReferenceDate(targets); // Pegs logic to Dec 2025
  const start = refDate.startOf("quarter");
  const end = refDate.endOf("quarter");

  const closedDeals = deals.filter(
    (d) =>
      d.stage === "Closed Won" &&
      d.amount &&
      d.closed_at &&
      dayjs(d.closed_at).isBetween(start, end, null, "[]")
  );

  return sumAmounts(closedDeals);
}

export function getQuarterTarget(targets: Target[]) {
  // const now = dayjs();
  const refDate = getReferenceDate(targets); 
  const currentQuarter = refDate.quarter();
  const currentYear = refDate.year();

  return targets
    .filter((t) => {
      const date = dayjs(t.month);
      return (
        date.quarter() === currentQuarter &&
        date.year() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.target, 0);
}

export function getQoQChange(deals: Deal[], targets: Target[]) {
  // const now = dayjs();
  const refDate = getReferenceDate(targets);
  const currentQStart = refDate.startOf("quarter");
  const currentQEnd = refDate.endOf("quarter");

  const prevQStart = refDate.subtract(1, "quarter").startOf("quarter");
  const prevQEnd = refDate.subtract(1, "quarter").endOf("quarter");

  const currentRevenue = sumAmounts(
    deals.filter(
      (d) =>
        d.stage === "Closed Won" &&
        d.amount &&
        d.closed_at &&
        dayjs(d.closed_at).isBetween(currentQStart, currentQEnd, null, "[]")
    )
  );

  const prevRevenue = sumAmounts(
    deals.filter(
      (d) =>
        d.stage === "Closed Won" &&
        d.amount &&
        d.closed_at &&
        dayjs(d.closed_at).isBetween(prevQStart, prevQEnd, null, "[]")
    )
  );

  if (!prevRevenue) return 0;

  return ((currentRevenue - prevRevenue) / prevRevenue) * 100;
}

/*DRIVERS */

export function getPipelineSize(deals: Deal[]) {
  return sumAmounts(
    deals.filter(
      (d) =>
        d.stage !== "Closed Won" &&
        d.stage !== "Closed Lost" &&
        d.amount
    )
  );
}

export function getWinRate(deals: Deal[]) {
  const closed = deals.filter(
    (d) => d.stage === "Closed Won" || d.stage === "Closed Lost"
  );

  const won = closed.filter((d) => d.stage === "Closed Won");

  return closed.length ? won.length / closed.length : 0; // decimal
}

export function getAverageDealSize(deals: Deal[]) {
  const wonDeals = deals.filter(
    (d) => d.stage === "Closed Won" && d.amount
  );

  return wonDeals.length
    ? sumAmounts(wonDeals) / wonDeals.length
    : 0;
}

export function getSalesCycleTime(deals: Deal[]) {
  const closedDeals = deals.filter(
    (d) =>
      d.stage === "Closed Won" &&
      d.created_at &&
      d.closed_at
  );

  if (!closedDeals.length) return 0;

  const totalDays = closedDeals.reduce((sum, d) => {
    return (
      sum +
      dayjs(d.closed_at).diff(dayjs(d.created_at), "day")
    );
  }, 0);

  return totalDays / closedDeals.length;
}

export function getRevenueDrivers(deals: Deal[], targets: Target[]) {
  // const now = dayjs();
  const refDate = getReferenceDate(targets);
  const getMonthDeals = (offset: number) => {
    const date = refDate.subtract(offset, "month");
    return deals.filter(
      (d) =>
        d.created_at &&
        dayjs(d.created_at).isSame(date, "month")
    );
  };

  const current = getMonthDeals(0);
  const previous = getMonthDeals(1);

  const pipelineTrend = Array.from({ length: 6 }).map((_, i) =>
    getPipelineSize(getMonthDeals(5 - i))
  );

  const winRateTrend = Array.from({ length: 6 }).map(
    (_, i) => getWinRate(getMonthDeals(5 - i)) * 100
  );

  const avgDealTrend = Array.from({ length: 6 }).map((_, i) =>
    getAverageDealSize(getMonthDeals(5 - i))
  );

  const cycleTrend = Array.from({ length: 6 }).map((_, i) =>
    getSalesCycleTime(getMonthDeals(5 - i))
  );

  return {
    pipelineSize: calculateMetricWithTrend(
      getPipelineSize(current),
      getPipelineSize(previous),
      pipelineTrend
    ),
    winRate: calculateMetricWithTrend(
      getWinRate(current) * 100,
      getWinRate(previous) * 100,
      winRateTrend
    ),
    averageDealSize: calculateMetricWithTrend(
      getAverageDealSize(current),
      getAverageDealSize(previous),
      avgDealTrend
    ),
    salesCycleTime: calculateMetricWithTrend(
      getSalesCycleTime(current),
      getSalesCycleTime(previous),
      cycleTrend
    ),
  };
}

/* RISK */

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
        d.amount &&
        d.created_at && refDate.diff(dayjs(d.created_at), "day") > STALE_DAYS
    )
    .map((d) => {
      const account = accountMap.get(d.account_id);
      const rep = repMap.get(d.rep_id);

      return {
        dealId: d.deal_id,
        accountName: account?.name ?? "Unknown",
        segment: account?.segment ?? "Unknown",
        repName: rep?.name ?? "Unknown",
        value: d.amount ?? 0,
        daysStale: d.created_at ? refDate.diff(dayjs(d.created_at), "day") : 0,
      };
    })
    .filter(
      (d) =>
        d.segment === "Enterprise" ||
        d.value > HIGH_VALUE_THRESHOLD
    )
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export function getUnderperformingReps(
  deals: Deal[],
  reps: Rep[]
) {
  const repStats = reps.map((rep) => {
    const repDeals = deals.filter(
      (d) => d.rep_id === rep.rep_id
    );

    const winRate = getWinRate(repDeals);
    const closedDeals = repDeals.filter(
      (d) =>
        d.stage === "Closed Won" ||
        d.stage === "Closed Lost"
    );

    return {
      repId: rep.rep_id,
      repName: rep.name,
      winRate: winRate * 100,
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
  accounts: Account[],
  reps: Rep[],
  targets: Target[]
) {
  const refDate = getReferenceDate(targets);
  const accountMap = buildMap(accounts, "account_id");
  const repMap = buildMap(reps, "rep_id");

  const recentActivities = activities.filter(
    (a) => refDate.diff(dayjs(a.timestamp), "day") < LOW_ACTIVITY_DAYS
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
    .map(([accountId, accountDeals]) => {
      const account = accountMap.get(accountId);
      const rep = repMap.get(accountDeals[0]?.rep_id);

      const totalValue = sumAmounts(accountDeals);

      return {
        accountId,
        accountName: account?.name ?? "Unknown",
        segment: account?.segment ?? "Unknown",
        repName: rep?.name ?? "Unassigned",
        openDeals: accountDeals.length,
        totalValue,
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 15);
}

/* TREND */

export function getRevenueTrendLast6Months(
  deals: Deal[],
  targets: Target[]
): MonthlyRevenueTrend[] {
  // const now = dayjs();
  const refDate = getReferenceDate(targets);
  const results: MonthlyRevenueTrend[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = refDate.subtract(i, "month");
    const revenue = sumAmounts(
      deals.filter(
        (d) =>
          d.stage === "Closed Won" &&
          d.amount &&
          d.closed_at &&
          dayjs(d.closed_at).isSame(date, "month")
      )
    );

    const monthKey = date.format("YYYY-MM");
    const target =
      targets.find((t) => t.month === monthKey)?.target ??
      0;

    results.push({
      month: date.format("MMM"),
      revenue,
      target,
      achieved: target ? (revenue / target) * 100 : 0,
    });
  }

  return results;
}
