import { Skeleton } from "@/components/ui/skeleton";

export default function BattleLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Score Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-6">
          <div className="text-center mb-6">
            <Skeleton className="w-32 h-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>

          <div className="border-t border-slate-700 pt-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input/Output */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <Skeleton className="h-4 w-40 mb-3" />
            <Skeleton className="h-20 w-full" />
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <Skeleton className="h-4 w-40 mb-3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
