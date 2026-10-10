import type { ChartPeriod, SearchResult } from "../../types/company";
import { HttpError } from "../../utils/httpError";
import { indianApiGet } from "./client";
import type { RawForecast, RawHistorical, RawIndustrySearchItem, RawStock, RawTargetPrice } from "./types";

export { indianApiCallCount } from "./client";
export { mapChart, mapCompany, mapForecasts } from "./mappers";

/** Full company snapshot. `query` may be an NSE symbol or a company name. */
export async function fetchStock(query: string): Promise<RawStock> {
  const raw = await indianApiGet<RawStock>("/stock", { name: query });
  if (!raw || typeof raw !== "object" || !raw.companyName) {
    throw HttpError.notFound(`No company found for "${query}"`);
  }
  return raw;
}

export const fetchHistorical = (symbol: string, period: ChartPeriod) =>
  indianApiGet<RawHistorical>("/historical_data", { stock_name: symbol, period, filter: "price" });

export const fetchTargetPrice = (symbol: string) => indianApiGet<RawTargetPrice>("/stock_target_price", { stock_id: symbol });

export const fetchEpsForecast = (symbol: string) =>
  indianApiGet<RawForecast>("/stock_forecasts", {
    stock_id: symbol,
    measure_code: "EPS",
    period_type: "Annual",
    data_type: "Estimates",
    age: "Current",
  });

export async function searchIndustry(query: string): Promise<SearchResult[]> {
  const items = await indianApiGet<RawIndustrySearchItem[]>("/industry_search", { query });
  return (Array.isArray(items) ? items : [])
    .filter((i) => i.exchangeCodeNsi || i.exchangeCodeBse)
    .map((i) => ({
      symbol: i.exchangeCodeNsi || i.exchangeCodeBse!,
      name: i.commonName,
      nseSymbol: i.exchangeCodeNsi || null,
      bseCode: i.exchangeCodeBse || null,
      exchange: i.exchangeCodeNsi ? "NSE" : "BSE",
    }));
}
