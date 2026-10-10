import type { CompanyDetails } from "@/types/company";
import { changeColor, formatNumber, formatPercent, formatPrice } from "@/lib/format";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/States";
import { FinancialTable } from "./FinancialTable";

/** Price returns, moving averages and the provider's grouped key metrics. */
export function RatiosSection({ company }: { company: CompanyDetails }) {
  const returns = company.returns.filter((r) => r.value !== null);
  const dmas = company.movingAverages.filter((m) => m.price !== null);

  return (
    <>
      <Section id="ratios" title="Ratios & Key Metrics" subtitle="Valuation, profitability, growth and balance-sheet strength">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Price Returns</h3>
            {returns.length ? (
              <dl className="grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
                {returns.map((r) => (
                  <div key={r.label} className="flex justify-between border-b border-slate-100 py-1.5">
                    <dt className="text-slate-500">{r.label}</dt>
                    <dd className={`font-medium tabular-nums ${changeColor(r.value)}`}>{formatPercent(r.value, true)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <EmptyState />
            )}
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Moving Averages</h3>
            {dmas.length ? (
              <dl className="grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
                {dmas.map((m) => (
                  <div key={m.days} className="flex justify-between border-b border-slate-100 py-1.5">
                    <dt className="text-slate-500">{m.days} DMA</dt>
                    <dd className="font-medium tabular-nums text-slate-800">{formatPrice(m.price)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {company.metricGroups.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {company.metricGroups.map((g) => (
              <details key={g.title} className="group rounded-md border border-slate-200 p-4 [&_summary::-webkit-details-marker]:hidden" open>
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-700">
                  {g.title}
                  <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <dl className="mt-2 max-h-72 overflow-y-auto pr-1 text-sm">
                  {g.items.map((i) => (
                    <div key={i.label} className="flex justify-between gap-3 border-b border-slate-100 py-1.5">
                      <dt className="text-slate-500">{i.label}</dt>
                      <dd className="shrink-0 font-medium tabular-nums text-slate-800">{formatNumber(i.value)}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState message="Detailed key metrics are not available for this company." />
          </div>
        )}
      </Section>
    </>
  );
}

export function ShareholdingSection({ company }: { company: CompanyDetails }) {
  return (
    <FinancialTable
      id="investors"
      title="Shareholding Pattern"
      subtitle="Numbers in percentages, by quarter"
      table={{ periods: company.shareholding.periods, rows: company.shareholding.rows }}
      percent
    />
  );
}
