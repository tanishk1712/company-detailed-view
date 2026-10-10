import { env } from "../config/env";
import {
  fetchEpsForecast,
  fetchHistorical,
  fetchStock,
  fetchTargetPrice,
  mapChart,
  mapCompany,
  mapForecasts,
} from "../providers/indianApi";
import type { ChartPeriod, CompanyDetails, Forecasts, PriceChart } from "../types/company";
import { cached, type CachedResult } from "../utils/cache";
import { HttpError } from "../utils/httpError";

const cacheKey = (symbol: string) => symbol.trim().toUpperCase();

export async function getCompany(symbol: string): Promise<CachedResult<CompanyDetails>> {
  // Unknown symbols are cached as `null` too, so repeated bad URLs don't spend provider quota.
  const result = await cached(`company:${cacheKey(symbol)}`, env.CACHE_TTL_COMPANY, async () => {
    try {
      return mapCompany(await fetchStock(symbol), new Date());
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) return null;
      throw err;
    }
  });
  if (!result.value) throw HttpError.notFound(`No company found for "${symbol}"`);
  return result as CachedResult<CompanyDetails>;
}

export function getPriceChart(symbol: string, period: ChartPeriod): Promise<CachedResult<PriceChart>> {
  return cached(`chart:${cacheKey(symbol)}:${period}`, env.CACHE_TTL_CHART, async () =>
    mapChart(await fetchHistorical(symbol, period), period),
  );
}

export function getForecasts(symbol: string): Promise<CachedResult<Forecasts>> {
  return cached(`forecast:${cacheKey(symbol)}`, env.CACHE_TTL_FORECAST, async () => {
    // Either half may be missing for smaller companies — only fail if both do.
    const [target, eps] = await Promise.allSettled([fetchTargetPrice(symbol), fetchEpsForecast(symbol)]);
    if (target.status === "rejected" && eps.status === "rejected") throw target.reason;
    return mapForecasts(
      target.status === "fulfilled" ? target.value : null,
      eps.status === "fulfilled" ? eps.value : null,
    );
  });
}
