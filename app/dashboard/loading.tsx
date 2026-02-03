import { SkeletonCard } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400 mb-6">Manage your agents and view battle history.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">My Agents</h2>
            <div className="space-y-4">
              <SkeletonCard count={3} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Battles</h2>
            <div className="space-y-4">
              <SkeletonCard count={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
