"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.num = num;
exports.mapCompany = mapCompany;
exports.mapChart = mapChart;
exports.mapForecasts = mapForecasts;
/* ------------------------------------------------------------------ helpers */
/** Parses provider numbers that may arrive as strings, "-" or null. */
function num(value) {
    if (value === null || value === undefined || value === "" || value === "-")
        return null;
    const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
}
const round = (n, digits = 2) => (n === null ? null : Number(n.toFixed(digits)));
const add = (...xs) => (xs.every((x) => x === null) ? null : xs.reduce((s, x) => s + (x ?? 0), 0));
const sub = (a, b) => (a === null || b === null ? null : a - b);
const pct = (a, b) => (a === null || b === null || b === 0 ? null : (a / b) * 100);
/** Provider keys are inconsistent ("returnOnAverageEquityMostRecentFiscalYear)"), so match on a normalised form. */
const normKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, "");
const toItemMap = (items = []) => new Map(items.map((i) => [normKey(i.key), num(i.value)]));
const pick = (map, key) => map.get(normKey(key)) ?? null;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-03-31" → "Mar 2026" */
function periodLabel(isoDate) {
    const [year, month] = isoDate.split("-");
    return `${MONTHS[Number(month) - 1] ?? month} ${year}`;
}
function buildTable(periods, statement, defs) {
    const usable = periods.filter((p) => p.stockFinancialMap?.[statement]?.length);
    const maps = usable.map((p) => toItemMap(p.stockFinancialMap[statement]));
    const rows = defs.map((d) => ({
        label: d.label,
        values: maps.map((m) => round(d.get(m))),
        ...(d.isPercent && { isPercent: true }),
        ...(d.highlight && { highlight: true }),
    }));
    return { periods: usable.map((p) => periodLabel(p.EndDate)), rows };
}
/* Screener-style derivations from Refinitiv-style line items (₹ crore). */
const operatingProfit = (m) => add(pick(m, "OperatingIncome"), pick(m, "Depreciation/Amortization"));
const interestExpense = (m) => {
    const net = pick(m, "InterestInc(Exp)Net-Non-OpTotal");
    return net === null ? null : -net;
};
const INCOME_ROWS = [
    { label: "Sales", get: (m) => pick(m, "TotalRevenue"), highlight: true },
    { label: "Expenses", get: (m) => sub(pick(m, "TotalRevenue"), operatingProfit(m)) },
    { label: "Operating Profit", get: operatingProfit, highlight: true },
    { label: "OPM %", get: (m) => pct(operatingProfit(m), pick(m, "TotalRevenue")), isPercent: true },
    {
        label: "Other Income",
        get: (m) => sub(sub(pick(m, "NetIncomeBeforeTaxes"), pick(m, "OperatingIncome")), pick(m, "InterestInc(Exp)Net-Non-OpTotal")),
    },
    { label: "Interest (net)", get: interestExpense },
    { label: "Depreciation", get: (m) => pick(m, "Depreciation/Amortization") },
    { label: "Profit before tax", get: (m) => pick(m, "NetIncomeBeforeTaxes"), highlight: true },
    { label: "Tax %", get: (m) => pct(pick(m, "ProvisionforIncomeTaxes"), pick(m, "NetIncomeBeforeTaxes")), isPercent: true },
    { label: "Net Profit", get: (m) => pick(m, "NetIncome"), highlight: true },
    { label: "EPS in Rs", get: (m) => pick(m, "DilutedEPSExcludingExtraOrdItems") },
];
const PNL_ROWS = [
    ...INCOME_ROWS,
    {
        label: "Dividend Payout %",
        get: (m) => pct(pick(m, "DPS-CommonStockPrimaryIssue"), pick(m, "DilutedEPSExcludingExtraOrdItems")),
        isPercent: true,
    },
];
const totalEquity = (m) => pick(m, "TotalEquity");
const investments = (m) => add(pick(m, "LongTermInvestments"), pick(m, "ShortTermInvestments"));
const intangibles = (m) => add(pick(m, "GoodwillNet"), pick(m, "IntangiblesNet"));
const BALANCE_ROWS = [
    { label: "Equity Capital", get: (m) => pick(m, "CommonStockTotal") },
    { label: "Reserves", get: (m) => sub(totalEquity(m), pick(m, "CommonStockTotal")) },
    { label: "Borrowings", get: (m) => pick(m, "TotalDebt") },
    { label: "Minority Interest", get: (m) => pick(m, "MinorityInterest") },
    {
        label: "Other Liabilities",
        get: (m) => sub(pick(m, "TotalLiabilitiesShareholders'Equity"), add(totalEquity(m), pick(m, "TotalDebt"), pick(m, "MinorityInterest"))),
    },
    { label: "Total Liabilities", get: (m) => pick(m, "TotalLiabilitiesShareholders'Equity"), highlight: true },
    { label: "Fixed Assets", get: (m) => pick(m, "Property/Plant/EquipmentTotal-Net") },
    { label: "Goodwill & Intangibles", get: intangibles },
    { label: "Investments", get: investments },
    { label: "Cash & Equivalents", get: (m) => pick(m, "Cash") },
    {
        label: "Other Assets",
        get: (m) => sub(pick(m, "TotalAssets"), add(pick(m, "Property/Plant/EquipmentTotal-Net"), intangibles(m), investments(m), pick(m, "Cash"))),
    },
    { label: "Total Assets", get: (m) => pick(m, "TotalAssets"), highlight: true },
];
const CASHFLOW_ROWS = [
    { label: "Cash from Operating Activity", get: (m) => pick(m, "CashfromOperatingActivities"), highlight: true },
    { label: "Cash from Investing Activity", get: (m) => pick(m, "CashfromInvestingActivities") },
    { label: "Cash from Financing Activity", get: (m) => pick(m, "CashfromFinancingActivities") },
    { label: "Net Cash Flow", get: (m) => pick(m, "NetChangeinCash"), highlight: true },
    { label: "Capital Expenditure", get: (m) => pick(m, "CapitalExpenditures") },
    { label: "Free Cash Flow", get: (m) => add(pick(m, "CashfromOperatingActivities"), pick(m, "CapitalExpenditures")) },
    { label: "Dividends Paid", get: (m) => pick(m, "TotalCashDividendsPaid") },
];
function splitFinancials(financials = []) {
    const byDate = (a, b) => a.EndDate.localeCompare(b.EndDate);
    const unique = (list) => list.filter((p, i) => list.findIndex((q) => q.EndDate === p.EndDate) === i);
    return {
        annual: unique(financials.filter((f) => f.Type === "Annual")).sort(byDate),
        interim: unique(financials.filter((f) => f.Type === "Interim")).sort(byDate),
    };
}
/* ------------------------------------------------------------- key metrics */
const METRIC_GROUP_TITLES = {
    valuation: "Valuation",
    margins: "Margins",
    growth: "Growth",
    mgmtEffectiveness: "Management Effectiveness",
    financialstrength: "Financial Strength",
    persharedata: "Per Share Data",
};
/** Absolute-amount metrics are reported in a different unit (₹ million) — skip them to avoid confusion. */
const EXCLUDED_METRIC = /perEmployee|freeCashFlowMostRecent|freeCashFlowtrailing|netDebt|isForCasted/i;
function buildMetricGroups(keyMetrics = {}) {
    return Object.entries(METRIC_GROUP_TITLES)
        .map(([key, title]) => ({
        title,
        items: (keyMetrics[key] ?? [])
            .filter((i) => !EXCLUDED_METRIC.test(i.key))
            .map((i) => ({ label: (i.displayName ?? i.key).trim(), value: round(num(i.value)) }))
            .filter((i) => i.value !== null),
    }))
        .filter((g) => g.items.length > 0);
}
function allMetrics(keyMetrics = {}) {
    return toItemMap(Object.values(keyMetrics).flatMap((items) => items ?? []));
}
/* ------------------------------------------------------------ shareholding */
const SHAREHOLDER_LABELS = {
    Promoter: "Promoters",
    FII: "FIIs",
    MF: "DIIs (MF & Insurance)",
    Other: "Public & Others",
};
function buildShareholding(raw = []) {
    const dates = [...new Set(raw.flatMap((r) => (r.categories ?? []).map((c) => c.holdingDate)))].sort();
    return {
        periods: dates.map(periodLabel),
        rows: raw.map((r) => ({
            label: SHAREHOLDER_LABELS[r.displayName] ?? r.displayName,
            values: dates.map((d) => round(num(r.categories?.find((c) => c.holdingDate === d)?.percentage))),
        })),
    };
}
/* ------------------------------------------------------- corporate actions */
const byDateDesc = (a, b) => (b.date ?? "").localeCompare(a.date ?? "");
const clean = (s) => (s && s.trim() ? s.trim() : null);
function buildCorporateActions(raw = {}) {
    const dividends = (raw.dividend ?? []).map((d) => ({
        date: clean(d.xdDate) ?? clean(d.recordDate),
        title: `${clean(d.interimOrFinal) ?? ""} Dividend${num(d.value) !== null ? ` · ₹${num(d.value)}/share` : ""}`.trim(),
        detail: clean(d.remarks),
    }));
    const boardMeetings = (raw.boardMeetings ?? []).map((b) => ({
        date: clean(b.boardMeetDate),
        title: clean(b.purpose) ?? "Board Meeting",
        detail: clean(b.remarks),
    }));
    const agms = (raw.annualGeneralMeeting ?? []).map((a) => ({
        date: clean(a.agmDate),
        title: clean(a.purpose) ?? "AGM",
        detail: clean(a.remarks),
    }));
    const others = [
        ...(raw.bonus ?? []).map((b) => ({ date: clean(b.xbDate) ?? clean(b.recordDate), title: "Bonus", detail: clean(b.remarks) })),
        ...(raw.splits ?? []).map((s) => ({ date: clean(s.xsDate) ?? clean(s.recordDate), title: "Split", detail: clean(s.remarks) })),
        ...(raw.rights ?? []).map((r) => ({ date: clean(r.xrDate) ?? clean(r.recordDate), title: "Rights", detail: clean(r.remarks) })),
    ];
    return {
        dividends: dividends.sort(byDateDesc),
        boardMeetings: boardMeetings.sort(byDateDesc),
        agms: agms.sort(byDateDesc),
        others: others.sort(byDateDesc),
    };
}
function buildDocuments(nse, bse) {
    const links = [];
    if (nse) {
        const s = encodeURIComponent(nse);
        links.push({ label: "Announcements (NSE)", url: `https://www.nseindia.com/companies-listing/corporate-filings-announcements?symbol=${s}` }, { label: "Financial Results (NSE)", url: `https://www.nseindia.com/companies-listing/corporate-filings-financial-results?symbol=${s}` }, { label: "Annual Reports (NSE)", url: `https://www.nseindia.com/companies-listing/corporate-filings-annual-reports?symbol=${s}` }, { label: "Credit Ratings (NSE)", url: `https://www.nseindia.com/companies-listing/corporate-filings-credit-rating?symbol=${s}` });
    }
    if (bse) {
        links.push({ label: "Company Page (BSE)", url: `https://www.bseindia.com/stock-share-price/company/scrip/${encodeURIComponent(bse)}/` });
    }
    return links;
}
/* ------------------------------------------------------------ main mapper */
function mapCompany(raw, fetchedAt) {
    const profile = raw.companyProfile ?? {};
    const details = raw.stockDetailsReusableData ?? {};
    const metrics = allMetrics(raw.keyMetrics);
    const { annual, interim } = splitFinancials(raw.financials);
    const nseSymbol = clean(profile.exchangeCodeNse);
    const bseCode = clean(profile.exchangeCodeBse);
    const nsePrice = num(raw.currentPrice?.NSE);
    const bsePrice = num(raw.currentPrice?.BSE);
    const price = nsePrice ?? bsePrice;
    const previousClose = num(details.close);
    const changePercent = num(raw.percentChange);
    const marketCap = num(details.marketCap) ?? pick(metrics, "marketCap");
    // Ratios derived from the latest annual balance sheet / P&L
    const latestBal = toItemMap(annual.at(-1)?.stockFinancialMap.BAL);
    const latestInc = toItemMap(annual.at(-1)?.stockFinancialMap.INC);
    const bookValue = (() => {
        const eq = pick(latestBal, "TotalEquity");
        const shares = pick(latestBal, "TotalCommonSharesOutstanding");
        return eq !== null && shares ? eq / shares : null;
    })();
    const roce = pct(add(pick(latestInc, "NetIncomeBeforeTaxes"), interestExpense(latestInc)), sub(pick(latestBal, "TotalAssets"), pick(latestBal, "TotalCurrentLiabilities")));
    const shareholding = buildShareholding(raw.shareholding);
    const promoterRow = shareholding.rows.find((r) => r.label === "Promoters");
    const keyRatios = [
        { key: "marketCap", label: "Market Cap", value: round(marketCap), format: "crore" },
        { key: "price", label: "Current Price", value: price, format: "price" },
        { key: "high", label: "52W High", value: num(raw.yearHigh), format: "price" },
        { key: "low", label: "52W Low", value: num(raw.yearLow), format: "price" },
        { key: "pe", label: "Stock P/E", value: pick(metrics, "pPerEBasicExcludingExtraordinaryItemsTTM"), format: "number" },
        { key: "bookValue", label: "Book Value", value: round(bookValue), format: "price" },
        { key: "pb", label: "Price to Book", value: round(price !== null && bookValue ? price / bookValue : null), format: "number" },
        { key: "dividendYield", label: "Dividend Yield", value: pick(metrics, "currentDividendYieldCommonStockPrimaryIssueLTM"), format: "percent" },
        { key: "roce", label: "ROCE", value: round(roce), format: "percent" },
        { key: "roe", label: "ROE", value: pick(metrics, "returnOnAverageEquityMostRecentFiscalYear"), format: "percent" },
        { key: "eps", label: "EPS (TTM)", value: pick(metrics, "ePSIncludingExtraOrdinaryItemsTrailing12Month"), format: "price" },
        { key: "debtToEquity", label: "Debt to Equity", value: pick(metrics, "totalDebtPerTotalEquityMostRecentFiscalYear"), format: "number" },
        { key: "sectorPe", label: "Industry P/E", value: num(details.sectorPriceToEarningsValueRatio), format: "number" },
        { key: "peg", label: "PEG Ratio", value: pick(metrics, "pegRatio"), format: "number" },
        { key: "salesGrowth3y", label: "Sales Growth 3Y", value: pick(metrics, "growthRatePercentRevenue3Year"), format: "percent" },
        { key: "epsGrowth5y", label: "EPS Growth 5Y", value: pick(metrics, "ePSGrowthRate5Year"), format: "percent" },
        { key: "promoterHolding", label: "Promoter Holding", value: promoterRow?.values.at(-1) ?? null, format: "percent" },
        { key: "beta", label: "Beta", value: pick(metrics, "beta"), format: "number" },
    ];
    const self = {
        name: raw.companyName ?? "",
        isSelf: true,
        price,
        changePercent,
        marketCap,
        pe: pick(metrics, "pPerEBasicExcludingExtraordinaryItemsTTM"),
        pb: round(price !== null && bookValue ? price / bookValue : null),
        roe: pick(metrics, "returnOnAverageEquityTrailing12Month") ?? pick(metrics, "returnOnAverageEquityMostRecentFiscalYear"),
        netMargin: pick(metrics, "netProfitMarginPercentTrailing12Month"),
        dividendYield: pick(metrics, "currentDividendYieldCommonStockPrimaryIssueLTM"),
        yearHigh: num(raw.yearHigh),
        yearLow: num(raw.yearLow),
        rating: clean(details.averageRating),
    };
    const peers = [
        self,
        ...(profile.peerCompanyList ?? []).map((p) => ({
            name: p.companyName,
            isSelf: false,
            price: num(p.price),
            changePercent: num(p.percentChange),
            marketCap: num(p.marketCap),
            pe: num(p.priceToEarningsValueRatio),
            pb: num(p.priceToBookValueRatio),
            roe: num(p.returnOnAverageEquityTrailing12Month),
            netMargin: num(p.netProfitMarginPercentTrailing12Month),
            dividendYield: num(p.dividendYieldIndicatedAnnualDividend),
            yearHigh: num(p.yhigh),
            yearLow: num(p.ylow),
            rating: clean(p.overallRating),
        })),
    ];
    const analystDistribution = (raw.analystView ?? [])
        .filter((a) => a.ratingName && !/total/i.test(a.ratingName))
        .map((a) => ({ rating: a.ratingName, count: num(a.numberOfAnalystsLatest) ?? 0, color: a.colorCode ?? null }));
    const analyst = analystDistribution.length || raw.recosBar?.isDataPresent
        ? {
            consensus: clean(details.averageRating),
            totalRecommendations: raw.recosBar?.noOfRecommendations ?? null,
            meanScore: num(raw.recosBar?.meanValue),
            distribution: analystDistribution,
        }
        : null;
    return {
        name: raw.companyName ?? nseSymbol ?? "Unknown company",
        nseSymbol,
        bseCode,
        isin: clean(profile.isInId),
        industry: clean(raw.industry),
        description: clean(profile.companyDescription),
        officers: (profile.officers?.officer ?? []).map((o) => ({
            name: [o.firstName, o.mI, o.lastName].filter(Boolean).join(" "),
            title: clean(o.title?.Value),
        })),
        quote: {
            price,
            nsePrice,
            bsePrice,
            change: round(sub(price, previousClose)),
            changePercent,
            previousClose,
            dayHigh: num(details.high),
            dayLow: num(details.low),
            yearHigh: num(raw.yearHigh),
            yearLow: num(raw.yearLow),
            asOf: details.date ? `${details.date}${details.time ? ` ${details.time}` : ""}` : null,
        },
        marketCap: round(marketCap),
        keyRatios,
        metricGroups: buildMetricGroups(raw.keyMetrics),
        movingAverages: (raw.stockTechnicalData ?? []).map((t) => ({ days: t.days, price: num(t.nsePrice) ?? num(t.bsePrice) })),
        returns: [
            { label: "1 Day", value: pick(metrics, "price1DayPercentChange") },
            { label: "1 Week", value: pick(metrics, "price5DayPercentChange") },
            { label: "Month to date", value: pick(metrics, "pricePercentChangeMonthToDate") },
            { label: "3 Months", value: pick(metrics, "price13WeekPricePercentChange") },
            { label: "6 Months", value: pick(metrics, "price26WeekPricePercentChange") },
            { label: "Year to date", value: pick(metrics, "priceYTDPricePercentChange") },
            { label: "1 Year", value: pick(metrics, "price52WeekPricePercentChange") },
        ],
        quarterly: buildTable(interim.slice(-12), "INC", INCOME_ROWS),
        profitLoss: buildTable(annual, "INC", PNL_ROWS),
        balanceSheet: buildTable(annual, "BAL", BALANCE_ROWS),
        cashFlow: buildTable(annual, "CAS", CASHFLOW_ROWS),
        shareholding,
        peers,
        analyst,
        corporateActions: buildCorporateActions(raw.stockCorporateActionData),
        news: (raw.recentNews ?? []).slice(0, 10).map((n) => ({
            headline: n.headline,
            date: n.date ?? null,
            url: n.url.startsWith("http") ? n.url : `https://www.livemint.com${n.url}`,
            thumbnail: n.thumbnailImage ?? n.listimage ?? null,
        })),
        documents: buildDocuments(nseSymbol, bseCode),
        meta: { source: "IndianAPI.in", fetchedAt: fetchedAt.toISOString() },
    };
}
/* ------------------------------------------------------ chart & forecasts */
function mapChart(raw, period) {
    const byDate = new Map();
    const point = (date) => {
        let p = byDate.get(date);
        if (!p) {
            p = { date, price: null, dma50: null, dma200: null, volume: null, delivery: null };
            byDate.set(date, p);
        }
        return p;
    };
    const FIELDS = {
        Price: "price",
        DMA50: "dma50",
        DMA200: "dma200",
        Volume: "volume",
    };
    for (const ds of raw.datasets ?? []) {
        const field = FIELDS[ds.metric];
        if (!field)
            continue;
        for (const [date, value, extra] of ds.values) {
            const p = point(date);
            p[field] = num(value);
            if (field === "volume" && extra?.delivery !== undefined)
                p.delivery = num(extra.delivery);
        }
    }
    return { period, points: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)) };
}
function mapForecasts(target, eps) {
    const t = target?.priceTarget;
    return {
        priceTarget: t
            ? { mean: num(t.Mean), median: num(t.Median), high: num(t.High), low: num(t.Low), analysts: t.NumberOfEstimates ?? null }
            : null,
        eps: (eps?.periods ?? [])
            .filter((p) => p.FiscalPeriod?.Year)
            .map((p) => {
            const actual = p.Actuals?.Actual?.[0];
            const estimate = p.Estimates?.Estimate?.[0];
            return {
                fiscalYear: p.FiscalPeriod.Year,
                isEstimate: !actual,
                value: num(actual?.Reported ?? estimate?.Mean),
                high: num(estimate?.High),
                low: num(estimate?.Low),
                analysts: estimate?.NumberOfEstimates ?? actual?.NumberOfEstimates ?? null,
                surprisePercent: num(actual?.SurprisePercent),
            };
        })
            .sort((a, b) => a.fiscalYear - b.fiscalYear),
    };
}
//# sourceMappingURL=mappers.js.map