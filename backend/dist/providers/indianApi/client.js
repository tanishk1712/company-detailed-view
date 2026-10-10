"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indianApiCallCount = void 0;
exports.indianApiGet = indianApiGet;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
const httpError_1 = require("../../utils/httpError");
/**
 * Thin HTTP client for IndianAPI.in (https://indianapi.in/indian-stock-market).
 * The API key is attached server-side only and never reaches the browser.
 */
const http = axios_1.default.create({
    baseURL: env_1.env.MARKET_API_BASE_URL,
    timeout: 15_000,
    headers: { "X-Api-Key": env_1.env.MARKET_API_KEY, Accept: "application/json" },
});
let upstreamCalls = 0;
const indianApiCallCount = () => upstreamCalls;
exports.indianApiCallCount = indianApiCallCount;
async function indianApiGet(path, params) {
    if (!env_1.env.MARKET_API_KEY) {
        throw httpError_1.HttpError.upstream("Market data provider is not configured (MARKET_API_KEY missing)");
    }
    upstreamCalls++;
    try {
        const { data } = await http.get(path, { params });
        return data;
    }
    catch (err) {
        throw toHttpError(err, path);
    }
}
function toHttpError(err, path) {
    const status = err.response?.status;
    console.warn(`IndianAPI ${path} failed:`, status ?? err.code, err.message);
    if (status === 404)
        return httpError_1.HttpError.notFound("Company not found");
    if (status === 401 || status === 403)
        return httpError_1.HttpError.upstream("Market data provider rejected the API key");
    if (status === 429)
        return httpError_1.HttpError.quotaExceeded();
    if (err.code === "ECONNABORTED")
        return httpError_1.HttpError.upstream("Market data provider timed out");
    return httpError_1.HttpError.upstream();
}
//# sourceMappingURL=client.js.map