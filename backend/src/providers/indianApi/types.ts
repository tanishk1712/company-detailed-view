/**
 * Partial shapes of IndianAPI.in responses — only the fields this app reads.
 * Numbers often arrive as strings ("1177.30", "-"), so fields are typed loosely
 * and parsed in the mappers.
 */

type Numeric = string | number | null | undefined;

export interface RawLineItem {
  displayName?: string;
  key: string;
  value: Numeric;
}

export interface RawFinancialPeriod {
  Type: "Annual" | "Interim";
  FiscalYear: string;
  EndDate: string;
  stockFinancialMap: { INC?: RawLineItem[]; BAL?: RawLineItem[]; CAS?: RawLineItem[] };
}

export interface RawPeer {
  companyName: string;
  price?: Numeric;
  percentChange?: Numeric;
  marketCap?: Numeric;
  priceToEarningsValueRatio?: Numeric;
  priceToBookValueRatio?: Numeric;
  returnOnAverageEquityTrailing12Month?: Numeric;
  netProfitMarginPercentTrailing12Month?: Numeric;
  dividendYieldIndicatedAnnualDividend?: Numeric;
  yhigh?: Numeric;
  ylow?: Numeric;
  overallRating?: string | null;
}

export interface RawStock {
  companyName?: string;
  industry?: string;
  companyProfile?: {
    companyDescription?: string;
    isInId?: string;
    exchangeCodeBse?: string;
    exchangeCodeNse?: string;
    peerCompanyList?: RawPeer[];
    officers?: {
      officer?: { firstName?: string; mI?: string; lastName?: string; title?: { Value?: string } }[];
    };
  };
  currentPrice?: { BSE?: Numeric; NSE?: Numeric };
  percentChange?: Numeric;
  yearHigh?: Numeric;
  yearLow?: Numeric;
  stockTechnicalData?: { days: number; nsePrice?: Numeric; bsePrice?: Numeric }[];
  financials?: RawFinancialPeriod[];
  keyMetrics?: Record<string, RawLineItem[] | undefined>;
  analystView?: { ratingName: string; colorCode?: string; numberOfAnalystsLatest?: Numeric }[];
  recosBar?: { meanValue?: number; noOfRecommendations?: number; isDataPresent?: boolean };
  shareholding?: { displayName: string; categories?: { holdingDate: string; percentage: Numeric }[] }[];
  stockCorporateActionData?: {
    dividend?: { remarks?: string; xdDate?: string; recordDate?: string; interimOrFinal?: string; value?: Numeric }[];
    boardMeetings?: { boardMeetDate?: string; purpose?: string; remarks?: string }[];
    annualGeneralMeeting?: { agmDate?: string; purpose?: string; remarks?: string }[];
    bonus?: { remarks?: string; xbDate?: string; recordDate?: string }[];
    splits?: { remarks?: string; xsDate?: string; recordDate?: string }[];
    rights?: { remarks?: string; xrDate?: string; recordDate?: string }[];
  };
  stockDetailsReusableData?: {
    close?: Numeric;
    date?: string;
    time?: string;
    high?: Numeric;
    low?: Numeric;
    marketCap?: Numeric;
    sectorPriceToEarningsValueRatio?: Numeric;
    averageRating?: string;
  };
  recentNews?: { headline: string; date?: string; url: string; thumbnailImage?: string; listimage?: string }[];
}

export interface RawHistorical {
  datasets?: { metric: string; label: string; values: [string, Numeric, { delivery?: number }?][] }[];
}

export interface RawForecast {
  periods?: {
    FiscalPeriod?: { Year: number };
    Actuals?: { Actual?: { Reported?: number; SurprisePercent?: number; NumberOfEstimates?: number }[] } | null;
    Estimates?: { Estimate?: { Mean?: number; High?: number; Low?: number; NumberOfEstimates?: number }[] } | null;
  }[];
}

export interface RawTargetPrice {
  priceTarget?: { Mean?: number; Median?: number; High?: number; Low?: number; NumberOfEstimates?: number };
}

export interface RawIndustrySearchItem {
  commonName: string;
  exchangeCodeBse?: string | null;
  exchangeCodeNsi?: string | null;
}
