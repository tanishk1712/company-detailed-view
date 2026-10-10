import axios, { AxiosError } from "axios";
import { env } from "../../config/env";
import { HttpError } from "../../utils/httpError";

/**
 * Thin HTTP client for IndianAPI.in (https://indianapi.in/indian-stock-market).
 * The API key is attached server-side only and never reaches the browser.
 */
const http = axios.create({
  baseURL: env.MARKET_API_BASE_URL,
  timeout: 15_000,
  headers: { "X-Api-Key": env.MARKET_API_KEY, Accept: "application/json" },
});

let upstreamCalls = 0;
export const indianApiCallCount = () => upstreamCalls;

export async function indianApiGet<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!env.MARKET_API_KEY) {
    throw HttpError.upstream("Market data provider is not configured (MARKET_API_KEY missing)");
  }

  upstreamCalls++;
  try {
    const { data } = await http.get<T>(path, { params });
    return data;
  } catch (err) {
    throw toHttpError(err as AxiosError, path);
  }
}

function toHttpError(err: AxiosError, path: string): HttpError {
  const status = err.response?.status;
  console.warn(`IndianAPI ${path} failed:`, status ?? err.code, err.message);

  if (status === 404) return HttpError.notFound("Company not found");
  if (status === 401 || status === 403) return HttpError.upstream("Market data provider rejected the API key");
  if (status === 429) return HttpError.quotaExceeded();
  if (err.code === "ECONNABORTED") return HttpError.upstream("Market data provider timed out");
  return HttpError.upstream();
}
