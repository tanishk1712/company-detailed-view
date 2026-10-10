"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyHandler = getCompanyHandler;
exports.getChartHandler = getChartHandler;
exports.getForecastsHandler = getForecastsHandler;
const company_service_1 = require("../services/company.service");
const httpError_1 = require("../utils/httpError");
const SYMBOL = /^[A-Za-z0-9&.\-' ]{1,80}$/;
const CHART_PERIODS = ["1m", "6m", "1yr", "3yr", "5yr", "10yr", "max"];
function parseSymbol(req) {
    const symbol = String(req.params.symbol ?? "").trim();
    if (!SYMBOL.test(symbol))
        throw httpError_1.HttpError.badRequest("Invalid company symbol");
    return symbol;
}
function send(res, result) {
    res.json({ success: true, data: result.value, meta: { stale: result.stale, cachedAt: new Date(result.storedAt).toISOString() } });
}
async function getCompanyHandler(req, res) {
    send(res, await (0, company_service_1.getCompany)(parseSymbol(req)));
}
async function getChartHandler(req, res) {
    const period = String(req.query.period ?? "1yr");
    if (!CHART_PERIODS.includes(period)) {
        throw httpError_1.HttpError.badRequest(`period must be one of: ${CHART_PERIODS.join(", ")}`);
    }
    send(res, await (0, company_service_1.getPriceChart)(parseSymbol(req), period));
}
async function getForecastsHandler(req, res) {
    send(res, await (0, company_service_1.getForecasts)(parseSymbol(req)));
}
//# sourceMappingURL=company.controller.js.map