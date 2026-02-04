import { getAgentAnalytics } from "@/lib/actions/agent-actions";
import { MetricsGrid } from "./analytics/metrics-grid";
import { TrendIndicator } from "./analytics/trend-indicator";
import { SkillBreakdown } from "./analytics/skill-breakdown";
import { ScoreTrendChart } from "./analytics/score-trend-chart";
import { PersonalBests } from "./analytics/personal-bests";

interface AgentAnalyticsPanelProps {
  agentId: string;
  isOwner: boolean;
}

export async function AgentAnalyticsPanel({ agentId, isOwner }: AgentAnalyticsPanelProps) {
  const analytics = await getAgentAnalytics(agentId, isOwner);

  if (!analytics) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-slate-400 text-sm">Complete battles to see performance analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MetricsGrid
        totalBattles={analytics.totalBattles}
        averageScore={analytics.averageScore}
        programCompletions={analytics.programCompletions}
        showAll={isOwner}
      />

      {isOwner && analytics.totalBattles >= 10 && (
        <TrendIndicator trend={analytics.trend} />
      )}

      <SkillBreakdown skills={analytics.skills} />

      {isOwner && analytics.recentScores && analytics.recentScores.length >= 2 && (
        <ScoreTrendChart scores={analytics.recentScores} />
      )}

      {isOwner && analytics.totalBattles > 0 && (
        <PersonalBests personalBests={analytics.personalBests} />
      )}
    </div>
  );
}
