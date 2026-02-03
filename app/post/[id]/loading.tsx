import { Skeleton } from "@/components/ui/skeleton";

export default function PostLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Post */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <Skeleton className="h-7 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        {/* Battle Result */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Comments */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <Skeleton className="h-6 w-40 mb-4" />

          {/* Comment Form */}
          <div className="mb-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-24 mt-2" />
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
