"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEpsForecast = exports.fetchTargetPrice = exports.fetchHistorical = exports.mapForecasts = exports.mapCompany = exports.mapChart = exports.indianApiCallCount = void 0;
exports.fetchStock = fetchStock;
exports.searchIndustry = searchIndustry;
const httpError_1 = require("../../utils/httpError");
const client_1 = require("./client");
var client_2 = require("./client");
Object.defineProperty(exports, "indianApiCallCount", { enumerable: true, get: function () { return client_2.indianApiCallCount; } });
var mappers_1 = require("./mappers");
Object.defineProperty(exports, "mapChart", { enumerable: true, get: function () { return mappers_1.mapChart; } });
Object.defineProperty(exports, "mapCompany", { enumerable: true, get: function () { return mappers_1.mapCompany; } });
Object.defineProperty(exports, "mapForecasts", { enumerable: true, get: function () { return mappers_1.mapForecasts; } });
/** Full company snapshot. `query` may be an NSE symbol or a company name. */
async function fetchStock(query) {
    const raw = await (0, client_1.indianApiGet)("/stock", { name: query });
    if (!raw || typeof raw !== "object" || !raw.companyName) {
        throw httpError_1.HttpError.notFound(`No company found for "${query}"`);
    }
    return raw;
}
const fetchHistorical = (symbol, period) => (0, client_1.indianApiGet)("/historical_data", { stock_name: symbol, period, filter: "price" });
exports.fetchHistorical = fetchHistorical;
const fetchTargetPrice = (symbol) => (0, client_1.indianApiGet)("/stock_target_price", { stock_id: symbol });
exports.fetchTargetPrice = fetchTargetPrice;
const fetchEpsForecast = (symbol) => (0, client_1.indianApiGet)("/stock_forecasts", {
    stock_id: symbol,
    measure_code: "EPS",
    period_type: "Annual",
    data_type: "Estimates",
    age: "Current",
});
exports.fetchEpsForecast = fetchEpsForecast;
async function searchIndustry(query) {
    const items = await (0, client_1.indianApiGet)("/industry_search", { query });
    return (Array.isArray(items) ? items : [])
        .filter((i) => i.exchangeCodeNsi || i.exchangeCodeBse)
        .map((i) => ({
        symbol: i.exchangeCodeNsi || i.exchangeCodeBse,
        name: i.commonName,
        nseSymbol: i.exchangeCodeNsi || null,
        bseCode: i.exchangeCodeBse || null,
        exchange: i.exchangeCodeNsi ? "NSE" : "BSE",
    }));
}
//# sourceMappingURL=index.js.map