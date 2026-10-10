"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_routes_1 = __importDefault(require("./company.routes"));
const health_routes_1 = __importDefault(require("./health.routes"));
const search_routes_1 = __importDefault(require("./search.routes"));
const router = (0, express_1.Router)();
router.use("/health", health_routes_1.default);
router.use("/search", search_routes_1.default);
router.use("/companies", company_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map