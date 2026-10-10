import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { KeyRatios } from "@/components/company/KeyRatios";
import { SectionNav } from "@/components/company/SectionNav";
import { PriceChart } from "@/components/company/PriceChart";
import { AnalysisSection } from "@/components/company/AnalysisSection";
import { PeersTable } from "@/components/company/PeersTable";
import { FinancialTable } from "@/components/company/FinancialTable";
import { RatiosSection, ShareholdingSection } from "@/components/company/RatiosSection";
import { DocumentsSection } from "@/components/company/DocumentsSection";

/** Deduplicates the fetch between generateMetadata and the page render. */
const getCompany = cache(async (symbol: string) => {
  try {
    return await api.company(symbol);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
});

export async function generateMetadata({ params }: PageProps<"/company/[symbol]">): Promise<Metadata> {
  const { symbol } = await params;
  try {
    const company = await getCompany(decodeURIComponent(symbol));
    return {
      title: `${company.name} share price & financials | StockLens`,
      description: company.description?.slice(0, 160) ?? `Financials, ratios and shareholding of ${company.name}`,
    };
  } catch {
    return { title: "Company | StockLens" };
  }
}

export default async function CompanyPage({ params }: PageProps<"/company/[symbol]">) {
  const { symbol } = await params;
  const company = await getCompany(decodeURIComponent(symbol));
  // Chart/forecast endpoints work best with the exchange ticker
  const tickerOrName = company.nseSymbol ?? company.name;

  return (
    <div className="space-y-4">
      <CompanyHeader company={company} />
      <SectionNav companyName={company.name} />
      <KeyRatios company={company} />
      <PriceChart symbol={tickerOrName} />
      <AnalysisSection symbol={tickerOrName} price={company.quote.price} analyst={company.analyst} />
      <PeersTable peers={company.peers} industry={company.industry} />
      <FinancialTable id="quarters" title="Quarterly Results" table={company.quarterly} />
      <FinancialTable id="profit-loss" title="Profit & Loss" table={company.profitLoss} />
      <FinancialTable id="balance-sheet" title="Balance Sheet" table={company.balanceSheet} />
      <FinancialTable id="cash-flow" title="Cash Flows" table={company.cashFlow} />
      <RatiosSection company={company} />
      <ShareholdingSection company={company} />
      <DocumentsSection company={company} />

      <p className="pt-2 text-center text-xs text-slate-400">
        Data source: {company.meta.source} · fetched {formatDate(company.meta.fetchedAt)}. For informational purposes only.
      </p>
    </div>
  );
}
