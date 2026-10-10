import type { ReactNode } from "react";
import clsx from "clsx";

export function EmptyState({ message = "Data not available from the provider for this company." }: { message?: string }) {
  return (
    <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {message}
    </p>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-6 text-center">
      <p className="text-sm text-rose-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded bg-slate-200", className)} />;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", className ?? "bg-slate-100 text-slate-600")}>
      {children}
    </span>
  );
}
