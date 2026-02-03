import { Skeleton } from "@/components/ui/skeleton";

export default function AgentDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />

        {/* Agent Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Battle History */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-slate-700 rounded-lg">
                <Skeleton className="w-10 h-10" />
                <Skeleton className="flex-1 h-4" />
                <Skeleton className="w-16 h-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
