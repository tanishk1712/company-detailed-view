"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompany = getCompany;
exports.getPriceChart = getPriceChart;
exports.getForecasts = getForecasts;
const env_1 = require("../config/env");
const indianApi_1 = require("../providers/indianApi");
const cache_1 = require("../utils/cache");
const httpError_1 = require("../utils/httpError");
const cacheKey = (symbol) => symbol.trim().toUpperCase();
async function getCompany(symbol) {
    // Unknown symbols are cached as `null` too, so repeated bad URLs don't spend provider quota.
    const result = await (0, cache_1.cached)(`company:${cacheKey(symbol)}`, env_1.env.CACHE_TTL_COMPANY, async () => {
        try {
            return (0, indianApi_1.mapCompany)(await (0, indianApi_1.fetchStock)(symbol), new Date());
        }
        catch (err) {
            if (err instanceof httpError_1.HttpError && err.status === 404)
                return null;
            throw err;
        }
    });
    if (!result.value)
        throw httpError_1.HttpError.notFound(`No company found for "${symbol}"`);
    return result;
}
function getPriceChart(symbol, period) {
    return (0, cache_1.cached)(`chart:${cacheKey(symbol)}:${period}`, env_1.env.CACHE_TTL_CHART, async () => (0, indianApi_1.mapChart)(await (0, indianApi_1.fetchHistorical)(symbol, period), period));
}
function getForecasts(symbol) {
    return (0, cache_1.cached)(`forecast:${cacheKey(symbol)}`, env_1.env.CACHE_TTL_FORECAST, async () => {
        // Either half may be missing for smaller companies — only fail if both do.
        const [target, eps] = await Promise.allSettled([(0, indianApi_1.fetchTargetPrice)(symbol), (0, indianApi_1.fetchEpsForecast)(symbol)]);
        if (target.status === "rejected" && eps.status === "rejected")
            throw target.reason;
        return (0, indianApi_1.mapForecasts)(target.status === "fulfilled" ? target.value : null, eps.status === "fulfilled" ? eps.value : null);
    });
}
//# sourceMappingURL=company.service.js.map