import { Router } from "express";
import { getChartHandler, getCompanyHandler, getForecastsHandler } from "../controllers/company.controller";

const router = Router();

router.get("/:symbol", getCompanyHandler);
router.get("/:symbol/chart", getChartHandler);
router.get("/:symbol/forecasts", getForecastsHandler);

export default router;
