"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const router = (0, express_1.Router)();
router.get("/:symbol", company_controller_1.getCompanyHandler);
router.get("/:symbol/chart", company_controller_1.getChartHandler);
router.get("/:symbol/forecasts", company_controller_1.getForecastsHandler);
exports.default = router;
//# sourceMappingURL=company.routes.js.map