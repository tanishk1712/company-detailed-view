"use client";

import Link from "next/link";

export default function CompanyError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-lg border border-rose-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Couldn&apos;t load this company</h1>
      <p className="mt-2 text-sm text-slate-600">
        The market data provider may be unavailable or rate-limited right now. Please try again in a moment.
      </p>
      {process.env.NODE_ENV === "development" && <p className="mt-3 font-mono text-xs text-rose-600">{error.message}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={() => retry()} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Try again
        </button>
        <Link href="/" className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50">
          Back to search
        </Link>
      </div>
    </div>
  );
}
