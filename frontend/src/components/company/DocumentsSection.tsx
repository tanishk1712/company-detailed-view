import type { CompanyDetails, CorporateEvent } from "@/types/company";
import { formatDate } from "@/lib/format";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/States";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

function EventList({ events, empty }: { events: CorporateEvent[]; empty: string }) {
  if (events.length === 0) return <EmptyState message={empty} />;
  return (
    <ul className="max-h-80 space-y-2.5 overflow-y-auto pr-1 text-sm">
      {events.map((e, i) => (
        <li key={`${e.date}-${e.title}-${i}`} className="border-b border-slate-100 pb-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-slate-800">{e.title}</span>
            <time className="shrink-0 text-xs text-slate-500">{formatDate(e.date)}</time>
          </div>
          {e.detail && <p className="mt-0.5 text-xs text-slate-500">{e.detail}</p>}
        </li>
      ))}
    </ul>
  );
}

export function DocumentsSection({ company }: { company: CompanyDetails }) {
  const { corporateActions: ca } = company;
  const meetings = [...ca.boardMeetings, ...ca.agms].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, 15);
  const actions = [...ca.dividends, ...ca.others].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return (
    <Section id="documents" title="Documents & Announcements" subtitle="Exchange filings, corporate actions and recent news">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Column title="Exchange Filings">
          {company.documents.length ? (
            <ul className="space-y-2 text-sm">
              {company.documents.map((d) => (
                <li key={d.url}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-2 text-indigo-600 hover:underline">
                    {d.label}
                    <span aria-hidden className="text-slate-400 group-hover:text-indigo-600">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="No exchange filing links available." />
          )}
          <p className="mt-4 text-xs text-slate-400">Filings open on the official NSE/BSE websites.</p>
        </Column>

        <Column title="Board Meetings & AGMs">
          <EventList events={meetings} empty="No board meetings reported." />
        </Column>

        <Column title="Dividends & Corporate Actions">
          <EventList events={actions} empty="No corporate actions reported." />
        </Column>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Recent News</h3>
        {company.news.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {company.news.map((n) => (
              <li key={n.url}>
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="group flex gap-3">
                  {n.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element -- third-party thumbnails, no need for next/image config
                    <img src={n.thumbnail} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded object-cover" />
                  )}
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-medium text-slate-800 group-hover:text-indigo-600">{n.headline}</span>
                    <span className="text-xs text-slate-500">{formatDate(n.date)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No recent news." />
        )}
      </div>
    </Section>
  );
}
