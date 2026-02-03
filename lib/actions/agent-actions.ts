"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { agentSchema, type AgentInput } from "@/lib/validations/agent";
import { moderateContent } from "@/lib/moderation";

export async function createAgent(data: AgentInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = agentSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid input", fields: validatedFields.error.flatten() };
  }

  // Moderate bio
  const bioModeration = moderateContent(validatedFields.data.bio, "bio");
  if (!bioModeration.allowed) {
    return { error: bioModeration.reason || "Bio contains inappropriate content" };
  }

  // Moderate prompt (lighter check)
  const promptModeration = moderateContent(validatedFields.data.prompt, "prompt");
  if (!promptModeration.allowed) {
    return { error: promptModeration.reason || "Prompt contains inappropriate content" };
  }

  const agent = await prisma.agent.create({
    data: {
      userId: session.user.id,
      ...validatedFields.data,
      traits: JSON.stringify(validatedFields.data.traits),
      skills: JSON.stringify(validatedFields.data.skills),
    },
  });

  return { success: true, agent };
}

export async function getMyAgents() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  const agents = await prisma.agent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return agents.map(agent => ({
    ...agent,
    traits: typeof agent.traits === 'string' ? JSON.parse(agent.traits) : agent.traits,
    skills: typeof agent.skills === 'string' ? JSON.parse(agent.skills) : agent.skills,
  }));
}

export async function getAgentById(id: string) {
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true } },
      battles: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { battles: true, follows: true } },
    },
  });

  if (!agent) {
    return null;
  }

  return {
    ...agent,
    traits: typeof agent.traits === 'string' ? JSON.parse(agent.traits) : agent.traits,
    skills: typeof agent.skills === 'string' ? JSON.parse(agent.skills) : agent.skills,
  };
}

export async function updateAgent(id: string, data: Partial<AgentInput>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check ownership
  const existingAgent = await prisma.agent.findUnique({
    where: { id },
  });

  if (!existingAgent || existingAgent.userId !== session.user.id) {
    return { error: "Agent not found or unauthorized" };
  }

  const validatedFields = agentSchema.partial().safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid input", fields: validatedFields.error.flatten() };
  }

  // Moderate bio if provided
  if (validatedFields.data.bio) {
    const bioModeration = moderateContent(validatedFields.data.bio, "bio");
    if (!bioModeration.allowed) {
      return { error: bioModeration.reason || "Bio contains inappropriate content" };
    }
  }

  // Moderate prompt if provided
  if (validatedFields.data.prompt) {
    const promptModeration = moderateContent(validatedFields.data.prompt, "prompt");
    if (!promptModeration.allowed) {
      return { error: promptModeration.reason || "Prompt contains inappropriate content" };
    }
  }

  const updateData: any = { ...validatedFields.data };
  if (updateData.traits) {
    updateData.traits = JSON.stringify(updateData.traits);
  }
  if (updateData.skills) {
    updateData.skills = JSON.stringify(updateData.skills);
  }

  const agent = await prisma.agent.update({
    where: { id },
    data: updateData,
  });

  return { success: true, agent };
}

export async function deleteAgent(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check ownership
  const existingAgent = await prisma.agent.findUnique({
    where: { id },
  });

  if (!existingAgent || existingAgent.userId !== session.user.id) {
    return { error: "Agent not found or unauthorized" };
  }

  await prisma.agent.delete({
    where: { id },
  });

  return { success: true };
}

export async function getRecentBattles() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  const battles = await prisma.battle.findMany({
    where: {
      agent: { userId: session.user.id },
    },
    include: {
      agent: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return battles.map(battle => ({
    ...battle,
    scoreBreakdown: typeof battle.scoreBreakdown === 'string' ? JSON.parse(battle.scoreBreakdown) : battle.scoreBreakdown,
  }));
}
