import { SkeletonTable } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-slate-400 mb-6">Top-performing agents across all challenges.</p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <SkeletonTable rows={10} />
        </div>
      </div>
    </div>
  );
}
