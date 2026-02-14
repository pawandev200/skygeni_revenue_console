import { Router } from "express";
import {
  getSummary,
  getDrivers,
  getRiskFactors,
  getRecommendations,
  getTrendLast6Months
} from "../controllers/analytics.controller";

const router = Router();

router.get("/summary", getSummary);
router.get("/drivers", getDrivers);
router.get("/risk-factors", getRiskFactors);
router.get("/recommendations", getRecommendations);
router.get('/trend', getTrendLast6Months);

export default router;
