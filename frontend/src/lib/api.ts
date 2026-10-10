import { API_BASE_URL } from "./config";
import type { ApiResponse } from "@/types/api";
import type { CompanyDetails, Forecasts, PriceChart, ChartPeriod, SearchResult } from "@/types/company";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "ERROR",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Typed fetch wrapper around the backend's `{ success, data | error }` envelope. */
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      signal: AbortSignal.timeout(20_000),
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch (err) {
    if (init?.signal?.aborted) throw err;
    throw new ApiError(0, "Unable to reach the server. Please check your connection and try again.", "NETWORK_ERROR");
  }

  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !body || !body.success) {
    const error = body && !body.success ? body.error : undefined;
    throw new ApiError(res.status, error?.message ?? `Request failed (${res.status})`, error?.code);
  }

  return body.data;
}

const enc = encodeURIComponent;

export const api = {
  // The backend caches provider responses, so the frontend always asks it for fresh data.
  company: (symbol: string) => apiGet<CompanyDetails>(`/companies/${enc(symbol)}`, { cache: "no-store" }),
  chart: (symbol: string, period: ChartPeriod, signal?: AbortSignal) =>
    apiGet<PriceChart>(`/companies/${enc(symbol)}/chart?period=${period}`, { signal }),
  forecasts: (symbol: string, signal?: AbortSignal) => apiGet<Forecasts>(`/companies/${enc(symbol)}/forecasts`, { signal }),
  search: (q: string, signal?: AbortSignal) => apiGet<SearchResult[]>(`/search?q=${enc(q)}`, { signal }),
};
