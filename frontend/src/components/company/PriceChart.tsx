"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, ApiError } from "@/lib/api";
import { formatNumber, formatVolume } from "@/lib/format";
import type { ChartPeriod, PriceChart as PriceChartData } from "@/types/company";
import { Section } from "@/components/ui/Section";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";

const PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: "1m", label: "1M" },
  { value: "6m", label: "6M" },
  { value: "1yr", label: "1Y" },
  { value: "3yr", label: "3Y" },
  { value: "5yr", label: "5Y" },
  { value: "10yr", label: "10Y" },
  { value: "max", label: "Max" },
];

const shortDate = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" });
const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

type State = { status: "loading" } | { status: "error"; message: string } | { status: "done"; data: PriceChartData };

export function PriceChart({ symbol }: { symbol: string }) {
  const [period, setPeriod] = useState<ChartPeriod>("1yr");
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api
      .chart(symbol, period, controller.signal)
      .then((data) => setState({ status: "done", data }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: err instanceof ApiError ? err.message : "Could not load the price chart." });
      });
    return () => controller.abort();
  }, [symbol, period, attempt]);

  const changePeriod = useCallback((p: ChartPeriod) => {
    setState({ status: "loading" });
    setPeriod(p);
  }, []);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((a) => a + 1);
  };

  return (
    <Section
      id="chart"
      title="Price & Volume"
      subtitle="Daily closing price on NSE with 50 & 200 day moving averages"
      actions={
        <div role="group" aria-label="Chart period" className="flex rounded-md bg-slate-100 p-0.5 text-xs font-medium">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={period === p.value}
              onClick={() => changePeriod(p.value)}
              className={clsx("rounded px-2.5 py-1", period === p.value ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900")}
            >
              {p.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-80 sm:h-96">
        {state.status === "loading" && <Skeleton className="h-full w-full" />}
        {state.status === "error" && <ErrorState message={state.message} onRetry={retry} />}
        {state.status === "done" &&
          (state.data.points.length === 0 ? (
            <EmptyState message="No price history available for this period." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={state.data.points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => shortDate.format(new Date(d))}
                  minTickGap={40}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="price"
                  orientation="right"
                  domain={["auto", "auto"]}
                  tickFormatter={(v: number) => formatNumber(v, 0)}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                {/* Volume uses its own hidden axis, scaled so bars occupy the bottom ~quarter */}
                <YAxis yAxisId="volume" hide domain={[0, (max: number) => max * 4]} />
                <Tooltip
                  labelFormatter={(d) => longDate.format(new Date(String(d)))}
                  formatter={(value, name) => [name === "Volume" ? formatVolume(Number(value)) : `₹ ${formatNumber(Number(value))}`, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="#c7d2fe" isAnimationActive={false} />
                <Line yAxisId="price" dataKey="price" name="Price" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="price" dataKey="dma50" name="50 DMA" stroke="#f59e0b" strokeWidth={1.25} dot={false} isAnimationActive={false} />
                <Line yAxisId="price" dataKey="dma200" name="200 DMA" stroke="#10b981" strokeWidth={1.25} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ))}
      </div>
    </Section>
  );
}
