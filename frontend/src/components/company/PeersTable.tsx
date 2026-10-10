import Link from "next/link";
import clsx from "clsx";
import type { Peer } from "@/types/company";
import { changeColor, formatNumber, formatPercent } from "@/lib/format";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/States";

const COLUMNS: { label: string; render: (p: Peer) => string; className?: (p: Peer) => string }[] = [
  { label: "CMP ₹", render: (p) => formatNumber(p.price) },
  { label: "Change %", render: (p) => formatPercent(p.changePercent, true), className: (p) => changeColor(p.changePercent) },
  { label: "Mar Cap ₹ Cr.", render: (p) => formatNumber(p.marketCap, 0) },
  { label: "P/E", render: (p) => formatNumber(p.pe) },
  { label: "P/B", render: (p) => formatNumber(p.pb) },
  { label: "ROE %", render: (p) => formatNumber(p.roe) },
  { label: "NPM %", render: (p) => formatNumber(p.netMargin) },
  { label: "Div Yld %", render: (p) => formatNumber(p.dividendYield) },
  { label: "52W High", render: (p) => formatNumber(p.yearHigh) },
  { label: "52W Low", render: (p) => formatNumber(p.yearLow) },
];

export function PeersTable({ peers, industry }: { peers: Peer[]; industry: string | null }) {
  const hasPeers = peers.some((p) => !p.isSelf);

  return (
    <Section id="peers" title="Peer Comparison" subtitle={industry ? `Sector: ${industry}` : undefined}>
      {hasPeers ? (
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-max border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th scope="col" className="px-2 py-2 text-left font-medium">S.No.</th>
                <th scope="col" className="sticky left-0 z-[1] bg-white px-3 py-2 text-left font-medium">Name</th>
                {COLUMNS.map((c) => (
                  <th key={c.label} scope="col" className="px-3 py-2 text-right font-medium whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {peers.map((p, i) => (
                <tr key={p.name} className={clsx("border-b border-slate-100", p.isSelf ? "bg-indigo-50/60 font-semibold" : "hover:bg-slate-50")}>
                  <td className="px-2 py-2 text-slate-500">{i + 1}.</td>
                  <th
                    scope="row"
                    className={clsx("sticky left-0 z-[1] px-3 py-2 text-left font-[inherit] whitespace-nowrap", p.isSelf ? "bg-indigo-50" : "bg-white")}
                  >
                    {p.isSelf ? (
                      <span className="text-slate-900">{p.name}</span>
                    ) : (
                      <Link href={`/company/${encodeURIComponent(p.name)}`} className="text-indigo-600 hover:underline">
                        {p.name}
                      </Link>
                    )}
                  </th>
                  {COLUMNS.map((c) => (
                    <td key={c.label} className={clsx("px-3 py-2 text-right whitespace-nowrap", c.className?.(p))}>
                      {c.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="Peer data is not available for this company." />
      )}
    </Section>
  );
}
