"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { api, ApiError } from "@/lib/api";
import type { SearchResult } from "@/types/company";

type Status = "idle" | "loading" | "done" | "error";

interface SearchBoxProps {
  autoFocus?: boolean;
  size?: "sm" | "lg";
}

/** Type-ahead company search (name, NSE ticker or BSE code) with keyboard navigation. */
export function SearchBox({ autoFocus, size = "sm" }: SearchBoxProps) {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const trimmed = query.trim();

  // Debounced search; aborts the previous request when the query changes
  useEffect(() => {
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const data = await api.search(trimmed, controller.signal);
        setResults(data);
        setActive(data.length ? 0 : -1);
        setStatus("done");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : "Search failed");
        setStatus("error");
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  // Close the dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const select = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(`/company/${encodeURIComponent(result.symbol)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      select(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && trimmed.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={clsx(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 fill-slate-400",
            size === "lg" ? "left-4 h-5 w-5" : "left-3 h-4 w-4",
          )}
        >
          <path d="M8.5 3a5.5 5.5 0 1 0 3.4 9.83l3.63 3.64a.75.75 0 1 0 1.06-1.06l-3.64-3.63A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
        </svg>
        <input
          type="search"
          role="combobox"
          aria-label="Search companies"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search company name, NSE ticker or BSE code"
          className={clsx(
            "w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100",
            size === "lg" ? "py-3.5 pl-12 pr-4 text-base shadow-sm" : "py-2 pl-9 pr-3 text-sm",
          )}
        />
      </div>

      {showDropdown && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          {status === "loading" && <p className="px-4 py-3 text-sm text-slate-500">Searching…</p>}
          {status === "error" && <p className="px-4 py-3 text-sm text-rose-600">{error}</p>}
          {status === "done" && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-500">No listed companies match &ldquo;{trimmed}&rdquo;.</p>
          )}
          {status === "done" && results.length > 0 && (
            <ul id={listId} role="listbox" className="max-h-80 overflow-y-auto py-1">
              {results.map((r, i) => (
                <li
                  key={`${r.exchange}:${r.symbol}`}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(r);
                  }}
                  className={clsx(
                    "flex cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm",
                    i === active && "bg-indigo-50",
                  )}
                >
                  <span className="truncate font-medium text-slate-800">{r.name}</span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {r.nseSymbol ?? r.symbol}
                    {r.bseCode && ` · ${r.bseCode}`}
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold">{r.exchange}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
