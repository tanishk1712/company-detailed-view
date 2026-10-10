"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

export const COMPANY_SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "chart", label: "Chart" },
  { id: "analysis", label: "Analysis" },
  { id: "peers", label: "Peers" },
  { id: "quarters", label: "Quarters" },
  { id: "profit-loss", label: "Profit & Loss" },
  { id: "balance-sheet", label: "Balance Sheet" },
  { id: "cash-flow", label: "Cash Flow" },
  { id: "ratios", label: "Ratios" },
  { id: "investors", label: "Investors" },
  { id: "documents", label: "Documents" },
] as const;

/** Sticky in-page navigation that highlights the section currently in view. */
export function SectionNav({ companyName }: { companyName: string }) {
  const [active, setActive] = useState<string>(COMPANY_SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    COMPANY_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Company sections" className="sticky top-14 z-10 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="hidden max-w-48 shrink-0 truncate text-sm font-semibold text-slate-800 lg:block">{companyName}</span>
        <ul className="flex gap-1 overflow-x-auto py-2 text-sm [scrollbar-width:none]">
          {COMPANY_SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={clsx(
                  "block whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors",
                  active === s.id ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200",
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
