import { Router } from "express";
import { indianApiCallCount } from "../providers/indianApi";
import { cacheStats } from "../utils/cache";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      uptime: process.uptime(),
      cache: cacheStats(),
      providerCallsSinceStart: indianApiCallCount(),
    },
  });
});

export default router;
