import clsx from "clsx";
import type { FinancialTable as FinancialTableData } from "@/types/company";
import { formatNumber } from "@/lib/format";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/States";

interface FinancialTableProps {
  id: string;
  title: string;
  subtitle?: string;
  table: FinancialTableData;
  /** Values are percentages throughout (e.g. shareholding) */
  percent?: boolean;
}

/** Horizontally scrollable statement table with a sticky label column, newest period on the right. */
export function FinancialTable({ id, title, subtitle = "Consolidated figures in ₹ crore", table, percent }: FinancialTableProps) {
  const hasData = table.periods.length > 0 && table.rows.some((r) => r.values.some((v) => v !== null));

  return (
    <Section id={id} title={title} subtitle={subtitle}>
      {hasData ? (
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-max border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th scope="col" className="sticky left-0 z-[1] bg-white px-4 py-2 text-left font-medium sm:pl-0" />
                {table.periods.map((p) => (
                  <th key={p} scope="col" className="px-3 py-2 text-right font-medium whitespace-nowrap">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.label} className={clsx("border-b border-slate-100 hover:bg-indigo-50/40", row.highlight && "font-semibold text-slate-900")}>
                  <th scope="row" className="sticky left-0 z-[1] bg-white px-4 py-2 text-left font-[inherit] whitespace-nowrap text-slate-700 sm:pl-0">
                    {row.label}
                  </th>
                  {row.values.map((v, i) => (
                    <td key={table.periods[i]} className={clsx("px-3 py-2 text-right whitespace-nowrap", v !== null && v < 0 && "text-rose-600")}>
                      {v === null ? "—" : percent || row.isPercent ? `${formatNumber(v)}%` : formatNumber(v, Math.abs(v) < 100 ? 2 : 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState />
      )}
    </Section>
  );
}
