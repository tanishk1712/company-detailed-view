import YahooFinance from "yahoo-finance2";
import type { SearchResult } from "../../types/company";

/**
 * Yahoo Finance is used only for company search (name / NSE ticker lookup),
 * which keeps the quota-limited primary provider for page data.
 */
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const EXCHANGES: Record<string, SearchResult["exchange"]> = { NSI: "NSE", BSE: "BSE", BOM: "BSE" };

export async function yahooSearch(query: string): Promise<SearchResult[]> {
  const { quotes } = (await yf.search(query, { quotesCount: 15, newsCount: 0 }, { validateResult: false })) as {
    quotes: { symbol?: string; exchange?: string; shortname?: string; longname?: string; quoteType?: string }[];
  };

  const results = new Map<string, SearchResult>();
  for (const q of quotes) {
    const exchange = q.exchange ? EXCHANGES[q.exchange] : undefined;
    if (!exchange || !q.symbol || q.quoteType !== "EQUITY") continue;

    const base = q.symbol.replace(/\.(NS|BO)$/, "");
    const existing = results.get(base);
    // Prefer the NSE listing; keep the BSE ticker as metadata
    if (existing && existing.exchange === "NSE") continue;

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
function titleCase(name: string) {
  if (name !== name.toUpperCase()) return name;
  return name.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\bLtd\b\.?/, "Ltd.");
}
