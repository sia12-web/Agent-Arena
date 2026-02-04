interface MetricsGridProps {
  totalBattles: number;
  averageScore: number;
  programCompletions: number;
  showAll?: boolean;
}

export function MetricsGrid({ totalBattles, averageScore, programCompletions, showAll }: MetricsGridProps) {
  return (
    <div className={`grid gap-4 mb-6 ${showAll ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-blue-400 mb-2">{totalBattles}</div>
        <div className="text-sm text-slate-400">Total Battles</div>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-green-400 mb-2">{averageScore}</div>
        <div className="text-sm text-slate-400">Average Score</div>
      </div>
      {showAll && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">{programCompletions}</div>
          <div className="text-sm text-slate-400">Programs Completed</div>
        </div>
      )}
    </div>
  );
}
