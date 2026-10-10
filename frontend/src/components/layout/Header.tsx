import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold text-indigo-600">
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
            <path d="M3 17l6-6 4 4 8-8M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">StockLens</span>
        </Link>
        <div className="w-full max-w-md">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
