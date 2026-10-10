import { SearchBox } from "@/components/search/SearchBox";

export default function CompanyNotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Company not found</h1>
      <p className="mt-2 text-sm text-slate-600">We couldn&apos;t find a listed company for that symbol. Try searching instead:</p>
      <div className="mt-6 text-left">
        <SearchBox autoFocus />
      </div>
    </div>
  );
}
