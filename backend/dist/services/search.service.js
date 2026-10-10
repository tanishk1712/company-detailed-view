"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCompanies = searchCompanies;
const env_1 = require("../config/env");
const indianApi_1 = require("../providers/indianApi");
const yahoo_1 = require("../providers/yahoo");
const cache_1 = require("../utils/cache");
const BSE_CODE = /^\d{6}$/;
/**
 * Company search by name, NSE ticker or BSE code.
 * Yahoo Finance handles names/tickers without spending provider quota; numeric
 * BSE codes (which Yahoo doesn't index) and Yahoo failures fall back to IndianAPI.
 */
function searchCompanies(query) {
    const q = query.trim();
    return (0, cache_1.cached)(`search:${q.toLowerCase()}`, env_1.env.CACHE_TTL_SEARCH, async () => {
        if (BSE_CODE.test(q))
            return (0, indianApi_1.searchIndustry)(q);
        try {
            const results = await (0, yahoo_1.yahooSearch)(q);
            if (results.length)
                return results;
        }
        catch (err) {
            console.warn("Yahoo search failed, falling back to IndianAPI:", err.message);
        }
        return (0, indianApi_1.searchIndustry)(q);
    });
}
//# sourceMappingURL=search.service.js.map