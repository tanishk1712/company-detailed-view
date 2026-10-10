import type { Request, Response } from "express";
import { getCompany, getForecasts, getPriceChart } from "../services/company.service";
import type { ChartPeriod } from "../types/company";
import { HttpError } from "../utils/httpError";
import type { CachedResult } from "../utils/cache";

const SYMBOL = /^[A-Za-z0-9&.\-' ]{1,80}$/;
const CHART_PERIODS: ChartPeriod[] = ["1m", "6m", "1yr", "3yr", "5yr", "10yr", "max"];

function parseSymbol(req: Request): string {
  const symbol = String(req.params.symbol ?? "").trim();
  if (!SYMBOL.test(symbol)) throw HttpError.badRequest("Invalid company symbol");
  return symbol;
}

function send<T>(res: Response, result: CachedResult<T>) {
  res.json({ success: true, data: result.value, meta: { stale: result.stale, cachedAt: new Date(result.storedAt).toISOString() } });
}

export async function getCompanyHandler(req: Request, res: Response) {
  send(res, await getCompany(parseSymbol(req)));
}

export async function getChartHandler(req: Request, res: Response) {
  const period = String(req.query.period ?? "1yr") as ChartPeriod;
  if (!CHART_PERIODS.includes(period)) {
    throw HttpError.badRequest(`period must be one of: ${CHART_PERIODS.join(", ")}`);
  }
  send(res, await getPriceChart(parseSymbol(req), period));
}

export async function getForecastsHandler(req: Request, res: Response) {
  send(res, await getForecasts(parseSymbol(req)));
}
