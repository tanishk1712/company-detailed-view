"use client";

import { useState } from "react";
import type { CompanyDetails, KeyRatio } from "@/types/company";
import { formatCrore, formatNumber, formatPercent, formatPrice } from "@/lib/format";

function formatRatio(r: KeyRatio) {
  switch (r.format) {
    case "crore":
      return formatCrore(r.value);
    case "price":
      return formatPrice(r.value);
    case "percent":
      return formatPercent(r.value);
    default:
      return formatNumber(r.value);
  }
}

/** Screener-style summary box: About + key officers on the left, headline ratios on the right. */
export function KeyRatios({ company }: { company: CompanyDetails }) {
  const [expanded, setExpanded] = useState(false);
  const description = company.description ?? "";
  const long = description.length > 420;

  return (
    <section id="summary" className="scroll-mt-28 grid gap-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[2fr_3fr]">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">About</h2>
        {description ? (
          <>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {long && !expanded ? `${description.slice(0, 420).trimEnd()}…` : description}
            </p>
            {long && (
              <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-1 text-sm font-medium text-indigo-600 hover:underline">
                {expanded ? "Read less" : "Read more"}
              </button>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No company description available.</p>
        )}

        {company.officers.length > 0 && (
          <>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">Key People</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {company.officers.slice(0, 5).map((o) => (
                <li key={o.name}>
                  <span className="font-medium text-slate-800">{o.name}</span>
                  {o.title && <span className="text-slate-500"> — {o.title}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-x-8 self-start rounded-md bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {company.keyRatios.map((r) => (
          <div key={r.key} className="flex items-baseline justify-between gap-2 border-b border-slate-200/70 py-2 text-sm">
            <dt className="text-slate-500">{r.label}</dt>
            <dd className="font-semibold tabular-nums text-slate-900">{formatRatio(r)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
