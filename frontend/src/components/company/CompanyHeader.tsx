import type { CompanyDetails } from "@/types/company";
import { changeColor, formatNumber, formatPercent, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/States";

export function CompanyHeader({ company }: { company: CompanyDetails }) {
  const { quote } = company;
  const up = (quote.change ?? 0) >= 0;

  return (
    <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{company.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {company.nseSymbol && (
            <a
              href={`https://www.nseindia.com/get-quotes/equity?symbol=${encodeURIComponent(company.nseSymbol)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">NSE: {company.nseSymbol}</Badge>
            </a>
          )}
          {company.bseCode && <Badge className="bg-indigo-50 text-indigo-700">BSE: {company.bseCode}</Badge>}
          {company.industry && <Badge>{company.industry}</Badge>}
          {company.isin && <span className="text-xs text-slate-400">ISIN {company.isin}</span>}
        </div>
      </div>

      <div className="shrink-0 sm:text-right">
        <div className="flex items-baseline gap-3 sm:justify-end">
          <span className="text-3xl font-semibold tabular-nums text-slate-900">{formatPrice(quote.price)}</span>
          <span className={`text-base font-medium tabular-nums ${changeColor(quote.change)}`}>
            {up ? "▲" : "▼"} {formatNumber(quote.change !== null ? Math.abs(quote.change) : null)} ({formatPercent(quote.changePercent, true)})
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {quote.asOf ? `As of ${quote.asOf}` : "Latest available price"}
          {quote.bsePrice !== null && quote.nsePrice !== null && ` · BSE ${formatPrice(quote.bsePrice)}`}
          {" · "}Day range {formatPrice(quote.dayLow)} – {formatPrice(quote.dayHigh)}
        </p>
      </div>
    </header>
  );
}
