import { env } from "../config/env";
import { searchIndustry } from "../providers/indianApi";
import { yahooSearch } from "../providers/yahoo";
import type { SearchResult } from "../types/company";
import { cached, type CachedResult } from "../utils/cache";

const BSE_CODE = /^\d{6}$/;

/**
 * Company search by name, NSE ticker or BSE code.
 * Yahoo Finance handles names/tickers without spending provider quota; numeric
 * BSE codes (which Yahoo doesn't index) and Yahoo failures fall back to IndianAPI.
 */
export function searchCompanies(query: string): Promise<CachedResult<SearchResult[]>> {
  const q = query.trim();
  return cached(`search:${q.toLowerCase()}`, env.CACHE_TTL_SEARCH, async () => {
    if (BSE_CODE.test(q)) return searchIndustry(q);

    try {
      const results = await yahooSearch(q);
      if (results.length) return results;
    } catch (err) {
      console.warn("Yahoo search failed, falling back to IndianAPI:", (err as Error).message);
    }
    return searchIndustry(q);
  });
}
