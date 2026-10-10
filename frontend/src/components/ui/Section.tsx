import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

/** White card used for every block on the company page; `id` doubles as the nav anchor. */
export function Section({ id, title, subtitle, actions, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-28 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
