import { Skeleton } from "@/components/ui/States";

export default function CompanyLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading company data">
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 sm:flex-row">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} className="h-6" />
          ))}
        </div>
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
