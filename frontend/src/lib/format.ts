import type { Num } from "@/types/company";

const inr0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

const missing = (v: Num | undefined): v is null | undefined => v === null || v === undefined || Number.isNaN(v);

export const formatNumber = (v: Num | undefined, digits: 0 | 2 = 2) =>
  missing(v) ? "—" : (digits === 0 ? inr0 : inr2).format(v);

export const formatPrice = (v: Num | undefined) => (missing(v) ? "—" : `₹ ${inr2.format(v)}`);

/** Amount already in crores, Screener-style: "₹ 15,93,186 Cr." */
export const formatCrore = (v: Num | undefined) => (missing(v) ? "—" : `₹ ${inr0.format(v)} Cr.`);

export const formatPercent = (v: Num | undefined, signed = false) =>
  missing(v) ? "—" : `${signed && v > 0 ? "+" : ""}${inr2.format(v)}%`;

/** Compact volume: 1.5 Cr / 12.3 L / 9,800 */
export function formatVolume(v: Num | undefined) {
  if (missing(v)) return "—";
  if (v >= 1e7) return `${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(2)} L`;
  return inr0.format(v);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : dateFmt.format(d);
}

export const changeColor = (v: Num | undefined) =>
  missing(v) || v === 0 ? "text-slate-500" : v > 0 ? "text-emerald-600" : "text-rose-600";
