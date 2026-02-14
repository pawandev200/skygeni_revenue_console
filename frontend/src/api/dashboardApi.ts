import axios from "axios";
import type {
  Summary,
  RevenueDrivers,
  RiskFactors,
  Recommendation,
  RevenueTrendMonth
} from "../types";

const api = axios.create({
  baseURL: "http://localhost:5001/api"
});

/* ---------------- SUMMARY ---------------- */

export const fetchSummary = async (): Promise<Summary> => {
  const res = await api.get("/summary");
  return res.data;
};

/* ---------------- DRIVERS ---------------- */

export const fetchDrivers = async (): Promise<RevenueDrivers> => {
  const res = await api.get("/drivers");
  return res.data;
};

/* ---------------- RISK ---------------- */

export const fetchRiskFactors = async (): Promise<RiskFactors> => {
  const res = await api.get("/risk-factors");
  return res.data;
};

/* ---------------- RECOMMENDATIONS ---------------- */

export const fetchRecommendations = async (): Promise<Recommendation[]> => {
  const res = await api.get("/recommendations");
  return res.data.recommendations;
};

/* ---------------- TREND ---------------- */

export const fetchTrend = async (): Promise<RevenueTrendMonth[]> => {
  const res = await api.get("/trend");
  return res.data.months;
};
