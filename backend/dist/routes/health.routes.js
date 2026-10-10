"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const indianApi_1 = require("../providers/indianApi");
const cache_1 = require("../utils/cache");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({
        success: true,
        data: {
            status: "ok",
            uptime: process.uptime(),
            cache: (0, cache_1.cacheStats)(),
            providerCallsSinceStart: (0, indianApi_1.indianApiCallCount)(),
        },
    });
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map