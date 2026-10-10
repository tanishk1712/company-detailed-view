import { Router } from "express";
import companyRoutes from "./company.routes";
import healthRoutes from "./health.routes";
import searchRoutes from "./search.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/search", searchRoutes);
router.use("/companies", companyRoutes);

export default router;
