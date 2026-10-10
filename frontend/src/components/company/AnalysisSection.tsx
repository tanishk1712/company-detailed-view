"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, ApiError } from "@/lib/api";
import { formatNumber, formatPercent, formatPrice } from "@/lib/format";
import type { AnalystSummary, Forecasts, Num } from "@/types/company";
import { Section } from "@/components/ui/Section";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";

interface AnalysisSectionProps {
  symbol: string;
  price: Num;
  analyst: AnalystSummary | null;
}

type State = { status: "loading" } | { status: "error"; message: string } | { status: "done"; data: Forecasts };

export function AnalysisSection({ symbol, price, analyst }: AnalysisSectionProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api
      .forecasts(symbol, controller.signal)
      .then((data) => setState({ status: "done", data }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: err instanceof ApiError ? err.message : "Could not load estimates." });
      });
    return () => controller.abort();
  }, [symbol, attempt]);

  return (
    <Section id="analysis" title="Analyst View & Estimates" subtitle="Broker consensus, price targets and EPS forecasts">
      <div className="grid gap-6 lg:grid-cols-3">
        <AnalystCard analyst={analyst} />
        {state.status === "loading" && (
          <>
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
          </>
        )}
        {state.status === "error" && (
          <div className="lg:col-span-2">
            <ErrorState
              message={state.message}
              onRetry={() => {
                setState({ status: "loading" });
                setAttempt((a) => a + 1);
              }}
            />
          </div>
        )}
        {state.status === "done" && (
          <>
            <PriceTargetCard target={state.data.priceTarget} price={price} />
            <EpsCard eps={state.data.eps} />
          </>
        )}
      </div>
    </Section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

function AnalystCard({ analyst }: { analyst: AnalystSummary | null }) {
  if (!analyst || analyst.distribution.length === 0) {
    return (
      <Card title="Analyst Recommendations">
        <EmptyState message="No analyst coverage reported." />
      </Card>
    );
  }
  const max = Math.max(...analyst.distribution.map((d) => d.count), 1);

  return (
    <Card title="Analyst Recommendations">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-xl font-semibold text-slate-900">{analyst.consensus ?? "—"}</span>
        {analyst.totalRecommendations !== null && <span className="text-xs text-slate-500">{analyst.totalRecommendations} analysts</span>}
      </div>
      <ul className="space-y-2 text-sm">
        {analyst.distribution.map((d) => (
          <li key={d.rating} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-2">
            <span className="text-slate-600">{d.rating}</span>
            <span className="h-2.5 rounded-full bg-slate-100">
              <span className="block h-full rounded-full" style={{ width: `${(d.count / max) * 100}%`, background: d.color ?? "#6366f1" }} />
            </span>
            <span className="text-right tabular-nums text-slate-700">{d.count}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PriceTargetCard({ target, price }: { target: Forecasts["priceTarget"]; price: Num }) {
  if (!target || target.mean === null) {
    return (
      <Card title="12-Month Price Target">
        <EmptyState message="No price target available." />
      </Card>
    );
  }
  const upside = price ? ((target.mean - price) / price) * 100 : null;
  const lo = Math.min(target.low ?? target.mean, price ?? Infinity);
  const hi = Math.max(target.high ?? target.mean, price ?? -Infinity);
  const pos = (v: number) => `${((v - lo) / (hi - lo || 1)) * 100}%`;

  return (
    <Card title="12-Month Price Target">
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-semibold text-slate-900">{formatPrice(target.mean)}</span>
        <span className={clsx("text-sm font-medium", (upside ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600")}>
          {formatPercent(upside, true)} {(upside ?? 0) >= 0 ? "upside" : "downside"}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Mean of {target.analysts ?? "—"} estimates · Median {formatPrice(target.median)}</p>

      <div className="relative mt-8 mb-6 h-2 rounded-full bg-gradient-to-r from-rose-200 via-amber-200 to-emerald-200">
        {price !== null && (
          <span className="absolute -top-6 -translate-x-1/2 text-[11px] font-medium whitespace-nowrap text-slate-700" style={{ left: pos(price) }}>
            CMP
            <span className="mx-auto mt-0.5 block h-4 w-0.5 bg-slate-800" />
          </span>
        )}
        <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-600 shadow" style={{ left: pos(target.mean) }} />
      </div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>Low {formatPrice(target.low)}</span>
        <span>High {formatPrice(target.high)}</span>
      </div>
    </Card>
  );
}

function EpsCard({ eps }: { eps: Forecasts["eps"] }) {
  if (eps.length === 0) {
    return (
      <Card title="EPS: Actual vs Estimates">
        <EmptyState message="No EPS forecasts available." />
      </Card>
    );
  }
  const data = eps.map((e) => ({ ...e, label: `FY${String(e.fiscalYear).slice(-2)}${e.isEstimate ? "E" : ""}` }));

  return (
    <Card title="EPS: Actual vs Estimates">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`₹ ${formatNumber(Number(v))}`, "EPS"]}
              contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#e2e8f0" }}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.isEstimate ? "#a5b4fc" : "#4f46e5"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-indigo-600" />
        Reported
        <span className="mr-1 ml-3 inline-block h-2 w-2 rounded-sm bg-indigo-300" />
        Consensus estimate (E)
      </p>
    </Card>
  );
}
