interface TrainingInsightsCardProps {
  coachReports: Array<{
    battle: {
      scoreTotal: number;
      challengeType: string;
      createdAt: Date;
    };
    recommendedFocus: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  isOwner: boolean;
}

export function TrainingInsightsCard({
  coachReports,
  isOwner,
}: TrainingInsightsCardProps) {
  if (coachReports.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">No Training Data Yet</h3>
          <p className="text-slate-400 text-sm">
            Complete battles to see training insights
          </p>
        </div>
      </div>
    );
  }

  // Get most recent focus recommendation
  const latestReport = coachReports[0];

  // Aggregate top strengths and weaknesses across recent battles
  const allStrengths = coachReports.flatMap((r) => r.strengths);
  const allWeaknesses = coachReports.flatMap((r) => r.weaknesses);

  // Get frequency count
  const strengthCounts = allStrengths.reduce(
    (acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const weaknessCounts = allWeaknesses.reduce(
    (acc, w) => {
      acc[w] = (acc[w] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get top 2 most common
  const topStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([s]) => s);

  const topWeaknesses = Object.entries(weaknessCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([w]) => w);

  const focusColors: Record<string, string> = {
    LOGIC: "bg-blue-900/30 border-blue-700 text-blue-300",
    DEBATE: "bg-purple-900/30 border-purple-700 text-purple-300",
    CREATIVITY: "bg-pink-900/30 border-pink-700 text-pink-300",
    GENERAL: "bg-green-900/30 border-green-700 text-green-300",
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Training Insights</h2>

      {/* Recommended Focus */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-2">Current Focus</h3>
        <span
          className={`px-3 py-1 rounded-lg text-sm font-medium ${focusColors[latestReport.recommendedFocus]}`}
        >
          {latestReport.recommendedFocus}
        </span>
      </div>

      {/* Top Strengths */}
      {topStrengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-green-400 mb-3">Top Strengths</h3>
          <ul className="space-y-2">
            {topStrengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Weaknesses (Owner Only) */}
      {isOwner && topWeaknesses.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-red-400 mb-3">Areas to Improve</h3>
          <ul className="space-y-2">
            {topWeaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-red-400">△</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isOwner && (
        <p className="text-xs text-slate-500 mt-4">
          Sign in as the owner to see detailed improvement areas
        </p>
      )}
    </div>
  );
}
