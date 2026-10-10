"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.yahooSearch = yahooSearch;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
/**
 * Yahoo Finance is used only for company search (name / NSE ticker lookup),
 * which keeps the quota-limited primary provider for page data.
 */
const yf = new yahoo_finance2_1.default({ suppressNotices: ["yahooSurvey"] });
const EXCHANGES = { NSI: "NSE", BSE: "BSE", BOM: "BSE" };
async function yahooSearch(query) {
    const { quotes } = (await yf.search(query, { quotesCount: 15, newsCount: 0 }, { validateResult: false }));
    const results = new Map();
    for (const q of quotes) {
        const exchange = q.exchange ? EXCHANGES[q.exchange] : undefined;
        if (!exchange || !q.symbol || q.quoteType !== "EQUITY")
            continue;
        const base = q.symbol.replace(/\.(NS|BO)$/, "");
        const existing = results.get(base);
        // Prefer the NSE listing; keep the BSE ticker as metadata
        if (existing && existing.exchange === "NSE")
            continue;
        results.set(base, {
            symbol: base,
            name: titleCase(q.longname ?? q.shortname ?? base),
            nseSymbol: exchange === "NSE" ? base : (existing?.nseSymbol ?? null),
            bseCode: null,
            exchange,
        });
    }
    return [...results.values()];
}
/** Yahoo returns names like "RELIANCE INDUSTRIES LTD" */
function titleCase(name) {
    if (name !== name.toUpperCase())
        return name;
    return name.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\bLtd\b\.?/, "Ltd.");
}
//# sourceMappingURL=index.js.map