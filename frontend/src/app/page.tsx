import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";

const POPULAR = [
  { symbol: "RELIANCE", name: "Reliance Industries" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK", name: "HDFC Bank" },
  { symbol: "INFY", name: "Infosys" },
  { symbol: "ITC", name: "ITC" },
  { symbol: "SBIN", name: "State Bank of India" },
];

export default function HomePage() {
  return (
    <section className="mx-auto max-w-2xl py-12 text-center sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Analyse Indian listed companies</h1>
      <p className="mt-3 text-slate-600">
        Live prices, financial statements, ratios, shareholding and peer comparison for NSE &amp; BSE companies.
      </p>

      <div className="mt-8 text-left">
        <SearchBox size="lg" autoFocus />
      </div>

      <div className="mt-8">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Popular</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {POPULAR.map((c) => (
            <li key={c.symbol}>
              <Link
                href={`/company/${c.symbol}`}
                className="inline-block rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
