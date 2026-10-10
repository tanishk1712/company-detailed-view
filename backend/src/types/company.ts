/**
 * Provider-agnostic domain models returned by the API.
 * All monetary amounts are in ₹ crore unless stated otherwise.
 */

export type Num = number | null;

export interface FinancialRow {
  label: string;
  values: Num[];
  /** Render as a percentage */
  isPercent?: boolean;
  /** Emphasise (totals, net profit) */
  highlight?: boolean;
}

export interface FinancialTable {
  /** Column headers, oldest → newest, e.g. "Mar 2026" */
  periods: string[];
  rows: FinancialRow[];
}

export interface Quote {
  price: Num;
  nsePrice: Num;
  bsePrice: Num;
  change: Num;
  changePercent: Num;
  previousClose: Num;
  dayHigh: Num;
  dayLow: Num;
  yearHigh: Num;
  yearLow: Num;
  asOf: string | null;
}

export interface KeyRatio {
  key: string;
  label: string;
  value: Num;
  /** Display hint for the frontend formatter */
  format: "crore" | "price" | "percent" | "number";
}

export interface MetricGroup {
  title: string;
  items: { label: string; value: Num }[];
}

export interface Peer {
  name: string;
  isSelf: boolean;
  price: Num;
  changePercent: Num;
  marketCap: Num;
  pe: Num;
  pb: Num;
  roe: Num;
  netMargin: Num;
  dividendYield: Num;
  yearHigh: Num;
  yearLow: Num;
  rating: string | null;
}

export interface ShareholdingTable {
  periods: string[];
  rows: { label: string; values: Num[] }[];
}

export interface AnalystSummary {
  consensus: string | null;
  totalRecommendations: number | null;
  /** 1 = Strong Buy … 5 = Strong Sell */
  meanScore: Num;
  distribution: { rating: string; count: number; color: string | null }[];
}

export interface CorporateEvent {
  date: string | null;
  title: string;
  detail: string | null;
}

export interface NewsItem {
  headline: string;
  date: string | null;
  url: string;
  thumbnail: string | null;
}

export interface DocumentLink {
  label: string;
  url: string;
}

export interface CompanyDetails {
  name: string;
  nseSymbol: string | null;
  bseCode: string | null;
  isin: string | null;
  industry: string | null;
  description: string | null;
  officers: { name: string; title: string | null }[];
  quote: Quote;
  marketCap: Num;
  keyRatios: KeyRatio[];
  metricGroups: MetricGroup[];
  movingAverages: { days: number; price: Num }[];
  returns: { label: string; value: Num }[];
  quarterly: FinancialTable;
  profitLoss: FinancialTable;
  balanceSheet: FinancialTable;
  cashFlow: FinancialTable;
  shareholding: ShareholdingTable;
  peers: Peer[];
  analyst: AnalystSummary | null;
  corporateActions: {
    dividends: CorporateEvent[];
    boardMeetings: CorporateEvent[];
    agms: CorporateEvent[];
    others: CorporateEvent[];
  };
  news: NewsItem[];
  documents: DocumentLink[];
  meta: { source: string; fetchedAt: string };
}

export type ChartPeriod = "1m" | "6m" | "1yr" | "3yr" | "5yr" | "10yr" | "max";

export interface ChartPoint {
  date: string;
  price: Num;
  dma50: Num;
  dma200: Num;
  volume: Num;
  /** Delivery percentage, when reported */
  delivery: Num;
}

export interface PriceChart {
  period: ChartPeriod;
  points: ChartPoint[];
}

export interface EstimatePoint {
  fiscalYear: number;
  isEstimate: boolean;
  /** Reported value for actuals, consensus mean for estimates */
  value: Num;
  high: Num;
  low: Num;
  analysts: number | null;
  surprisePercent: Num;
}

export interface Forecasts {
  priceTarget: {
    mean: Num;
    median: Num;
    high: Num;
    low: Num;
    analysts: number | null;
  } | null;
  eps: EstimatePoint[];
}

export interface SearchResult {
  /** Identifier to use in /companies/:symbol */
  symbol: string;
  name: string;
  nseSymbol: string | null;
  bseCode: string | null;
  exchange: "NSE" | "BSE";
}
