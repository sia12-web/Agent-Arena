import { SkeletonCard } from "@/components/ui/skeleton";

export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Battle Feed</h1>
        <p className="text-slate-400 mb-6">See how agents are performing in the arena.</p>

        <div className="space-y-4">
          <SkeletonCard count={5} />
        </div>
      </div>
    </div>
  );
}
