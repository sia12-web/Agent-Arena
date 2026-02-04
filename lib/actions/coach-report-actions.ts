"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoachReport } from "@/lib/coach-report";

// Get coach report for a battle
export async function getCoachReport(battleId: string) {
  const report = await prisma.battleCoachReport.findUnique({
    where: { battleId },
  });

  if (!report) {
    return null;
  }

  return {
    ...report,
    strengths: JSON.parse(report.strengthsJson),
    weaknesses: JSON.parse(report.weaknessesJson),
    promptSuggestions: JSON.parse(report.promptSuggestionsJson),
    nextDrills: JSON.parse(report.nextDrillsJson),
  };
}

// Regenerate coach report (owner only, deterministic)
export async function regenerateCoachReport(battleId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Get battle with agent to verify ownership
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: { agent: true },
  });

  if (!battle || battle.agent.userId !== session.user.id) {
    return { error: "Battle not found or unauthorized" };
  }

  // Regenerate report (deterministic - same result)
  const scoreBreakdown = JSON.parse(battle.scoreBreakdown);
  const coachReport = generateCoachReport(
    battle.challengeType as "logic" | "debate" | "creativity",
    scoreBreakdown,
    battle.inputText,
    battle.outputText || ""
  );

  // Upsert (update if exists, create if doesn't)
  const report = await prisma.battleCoachReport.upsert({
    where: { battleId },
    create: {
      battleId,
      strengthsJson: JSON.stringify(coachReport.strengths),
      weaknessesJson: JSON.stringify(coachReport.weaknesses),
      promptSuggestionsJson: JSON.stringify(coachReport.promptSuggestions),
      nextDrillsJson: JSON.stringify(coachReport.nextDrills),
      recommendedFocus: coachReport.recommendedFocus,
    },
    update: {
      strengthsJson: JSON.stringify(coachReport.strengths),
      weaknessesJson: JSON.stringify(coachReport.weaknesses),
      promptSuggestionsJson: JSON.stringify(coachReport.promptSuggestions),
      nextDrillsJson: JSON.stringify(coachReport.nextDrills),
      recommendedFocus: coachReport.recommendedFocus,
    },
  });

  return { success: true, report };
}

// Get coach reports for agent's recent battles (for profile insights)
export async function getAgentCoachInsights(agentId: string, limit = 5) {
  const reports = await prisma.battleCoachReport.findMany({
    where: {
      battle: {
        agentId,
      },
    },
    include: {
      battle: {
        select: {
          scoreTotal: true,
          challengeType: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      battle: {
        createdAt: "desc",
      },
    },
    take: limit,
  });

  return reports.map((r: any) => ({
    ...r,
    strengths: JSON.parse(r.strengthsJson),
    weaknesses: JSON.parse(r.weaknessesJson),
    promptSuggestions: JSON.parse(r.promptSuggestionsJson),
    nextDrills: JSON.parse(r.nextDrillsJson),
  }));
}
