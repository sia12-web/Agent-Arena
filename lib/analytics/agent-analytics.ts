// Types for Agent Analytics

export type ChallengeType = "logic" | "debate" | "creativity";
export type TrendDirection = "improving" | "stable" | "declining";

export interface SkillBreakdown {
  logic: { average: number; count: number; best: number };
  debate: { average: number; count: number; best: number };
  creativity: { average: number; count: number; best: number };
}

export interface PersonalBests {
  overall: number;
  logic: number;
  debate: number;
  creativity: number;
}

export interface TrendData {
  direction: TrendDirection;
  recentAverage: number;
  previousAverage: number;
  changePercent: number;
}

export interface AgentAnalytics {
  totalBattles: number;
  averageScore: number;
  programCompletions: number;
  skills: SkillBreakdown;
  trend: TrendData;
  personalBests: PersonalBests;
  recentScores?: Array<{ score: number; challengeType: ChallengeType; createdAt: Date }>;
}

// Helper function to compute core metrics
export function computeCoreMetrics(battles: Array<{ scoreTotal: number }>) {
  return {
    totalBattles: battles.length,
    averageScore: battles.length
      ? Math.round(battles.reduce((sum, b) => sum + b.scoreTotal, 0) / battles.length)
      : 0,
  };
}

// Compute skill breakdown by challenge type
export function computeSkillBreakdown(
  battles: Array<{ scoreTotal: number; challengeType: ChallengeType }>
): SkillBreakdown {
  const byType = { logic: [], debate: [], creativity: [] } as Record<ChallengeType, number[]>;

  battles.forEach((b) => byType[b.challengeType].push(b.scoreTotal));

  return {
    logic: {
      count: byType.logic.length,
      best: byType.logic.length ? Math.max(...byType.logic) : 0,
      average: byType.logic.length
        ? Math.round(byType.logic.reduce((a, b) => a + b, 0) / byType.logic.length)
        : 0,
    },
    debate: {
      count: byType.debate.length,
      best: byType.debate.length ? Math.max(...byType.debate) : 0,
      average: byType.debate.length
        ? Math.round(byType.debate.reduce((a, b) => a + b, 0) / byType.debate.length)
        : 0,
    },
    creativity: {
      count: byType.creativity.length,
      best: byType.creativity.length ? Math.max(...byType.creativity) : 0,
      average: byType.creativity.length
        ? Math.round(byType.creativity.reduce((a, b) => a + b, 0) / byType.creativity.length)
        : 0,
    },
  };
}

// Compute performance trend
export function computeTrend(battles: Array<{ scoreTotal: number; createdAt: Date }>): TrendData {
  // Need at least 10 battles to compute trend
  if (battles.length < 10) {
    return {
      direction: "stable",
      recentAverage: 0,
      previousAverage: 0,
      changePercent: 0,
    };
  }

  // Sort by date (oldest first)
  const sorted = [...battles].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Last 5 battles (most recent)
  const recent = sorted.slice(-5);
  const recentAverage = recent.reduce((sum, b) => sum + b.scoreTotal, 0) / 5;

  // Previous 5 battles
  const previous = sorted.slice(-10, -5);
  const previousAverage = previous.reduce((sum, b) => sum + b.scoreTotal, 0) / 5;

  // Calculate change
  const change = recentAverage - previousAverage;
  const changePercent = previousAverage > 0
    ? Math.round((change / previousAverage) * 100)
    : 0;

  // Determine direction
  let direction: TrendDirection = "stable";
  if (changePercent >= 5) {
    direction = "improving";
  } else if (changePercent <= -5) {
    direction = "declining";
  }

  return {
    direction,
    recentAverage: Math.round(recentAverage),
    previousAverage: Math.round(previousAverage),
    changePercent,
  };
}

// Compute personal bests
export function computePersonalBests(
  battles: Array<{ scoreTotal: number; challengeType: ChallengeType }>
): PersonalBests {
  const bests: PersonalBests = {
    overall: 0,
    logic: 0,
    debate: 0,
    creativity: 0,
  };

  battles.forEach((battle) => {
    if (battle.scoreTotal > bests.overall) {
      bests.overall = battle.scoreTotal;
    }
    if (battle.scoreTotal > bests[battle.challengeType]) {
      bests[battle.challengeType] = battle.scoreTotal;
    }
  });

  return bests;
}
