"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { battleSchema } from "@/lib/validations/battle";
import { scoreChallenge } from "@/lib/scoring";
import { checkRateLimit, createRateLimitError, RATE_LIMITS } from "@/lib/rate-limiter";

export async function createBattle(data: {
  agentId: string;
  challengeType: "logic" | "debate" | "creativity";
  inputText: string;
  outputText: string;
  programId?: string;
  drillId?: string;
  enrollmentId?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Rate limit check
  const rateLimit = await checkRateLimit(
    `battleSubmit:${session.user.id}`,
    RATE_LIMITS.battleSubmit.limit,
    RATE_LIMITS.battleSubmit.window
  );

  if (!rateLimit.allowed) {
    return createRateLimitError(rateLimit.retryAt!);
  }

  const validatedFields = battleSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid input", fields: validatedFields.error.flatten() };
  }

  // Verify agent ownership
  const agent = await prisma.agent.findUnique({
    where: { id: data.agentId },
  });

  if (!agent || agent.userId !== session.user.id) {
    return { error: "Agent not found or unauthorized" };
  }

  // Score the battle
  const { scoreTotal, scoreBreakdown } = scoreChallenge(
    data.challengeType,
    data.inputText,
    data.outputText
  );

  if (scoreTotal === 0 && scoreBreakdown.blocked_content) {
    return { error: "Content blocked. Please ensure your input is appropriate." };
  }

  // Create battle with optional program context
  const battle = await prisma.battle.create({
    data: {
      agentId: data.agentId,
      challengeType: data.challengeType,
      inputText: data.inputText,
      outputText: data.outputText,
      scoreTotal,
      scoreBreakdown: JSON.stringify(scoreBreakdown),
      programId: data.programId,
      drillId: data.drillId,
    },
  });

  // Update agent rating (simplified Elo)
  const newRating = Math.round(agent.rating + (scoreTotal - 50) / 10);
  await prisma.agent.update({
    where: { id: data.agentId },
    data: { rating: Math.max(100, newRating) },
  });

  // If this is a drill battle, mark it complete
  if (data.enrollmentId && data.drillId) {
    const { completeDrill } = await import("@/lib/actions/program-actions");
    await completeDrill({
      enrollmentId: data.enrollmentId,
      drillId: data.drillId,
      battleId: battle.id,
    });
  }

  // Generate and save coach report
  const { generateCoachReport } = await import("@/lib/coach-report");
  const coachReport = generateCoachReport(
    data.challengeType,
    scoreBreakdown,
    data.inputText,
    data.outputText
  );

  await prisma.battleCoachReport.create({
    data: {
      battleId: battle.id,
      strengthsJson: JSON.stringify(coachReport.strengths),
      weaknessesJson: JSON.stringify(coachReport.weaknesses),
      promptSuggestionsJson: JSON.stringify(coachReport.promptSuggestions),
      nextDrillsJson: JSON.stringify(coachReport.nextDrills),
      recommendedFocus: coachReport.recommendedFocus,
    },
  });

  return { success: true, battle, scoreTotal, scoreBreakdown };
}

export async function getUserAgents() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  const agents = await prisma.agent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return agents;
}

export async function getBattleById(id: string) {
  const battle = await prisma.battle.findUnique({
    where: { id },
    include: {
      agent: true,
      coachReport: true,
    },
  });

  if (!battle) {
    return null;
  }

  const result: any = {
    ...battle,
    scoreBreakdown: JSON.parse(battle.scoreBreakdown),
  };

  // Parse coach report JSON if exists
  if (battle.coachReport) {
    result.coachReport = {
      ...battle.coachReport,
      strengths: JSON.parse(battle.coachReport.strengthsJson),
      weaknesses: JSON.parse(battle.coachReport.weaknessesJson),
      promptSuggestions: JSON.parse(battle.coachReport.promptSuggestionsJson),
      nextDrills: JSON.parse(battle.coachReport.nextDrillsJson),
    };
  }

  return result;
}

// Generate a simple agent response (template-based for MVP)
export async function generateAgentResponse(
  challengeType: "logic" | "debate" | "creativity",
  input: string,
  agentPrompt: string
): Promise<string> {
  // In a real implementation, this would call an LLM
  // For MVP, we use template responses

  const templates = {
    logic: [
      `To solve this problem, I'll approach it step by step:\n\n1. First, let me understand the given information.\n2. Next, I'll analyze the relationships.\n3. Finally, I'll reach a conclusion.\n\nAnswer: Based on the logical analysis, the conclusion is clear.`,
      `Step 1: Identify the key elements.\nStep 2: Analyze the logical structure.\nStep 3: Draw a conclusion.\n\nTherefore, the answer is derived from valid reasoning.`,
    ],
    debate: [
      `Claim: ${input.substring(0, 50)}...\n\nReason: The evidence supports this position because of fundamental principles and practical considerations.\n\nExample: In practice, we see this approach leading to better outcomes.\n\nHowever, I acknowledge that opponents might argue... but I believe the stronger case is for my position.`,
      `My position on this topic is based on several key arguments:\n\n1. First, there are practical considerations.\n2. Second, ethical principles support this view.\n3. Third, real-world examples demonstrate validity.\n\nWhile others may disagree, I believe the preponderance of evidence favors this stance.`,
    ],
    creativity: [
      `Once upon a time, in a world not unlike our own, something extraordinary happened. The characters in our story discovered that creativity and imagination could change reality itself.\n\nAs the story unfolds, we see how courage and innovation triumph over adversity. The journey leads to unexpected revelations and meaningful transformations.\n\nIn the end, the true power of human spirit shines through.`,
      `In the vast tapestry of existence, there are moments that define who we are. This is one such moment.\n\nThe adventure begins with a simple discovery, but soon blossoms into an epic journey of self-discovery and wonder. Along the way, challenges are met with creativity, and obstacles become opportunities.\n\nThe conclusion reminds us that within every challenge lies the seed of growth.`,
    ],
  };

  const typeTemplates = templates[challengeType];
  return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
}
