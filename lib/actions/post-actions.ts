"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getFeedPosts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, email: true } },
      battle: {
        include: {
          agent: { select: { id: true, name: true, avatar: true } },
        },
      },
      _count: { select: { comments: true } },
    },
  });

  return posts;
}

export async function getPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, email: true } },
      battle: {
        include: {
          agent: true,
        },
      },
      votes: true,
      _count: { select: { comments: true } },
    },
  });

  return post;
}

export async function createOrUpdatePostForBattle(battleId: string, title?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Get the battle with agent info
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: { agent: true },
  });

  if (!battle) {
    return { error: "Battle not found" };
  }

  // Verify ownership
  if (battle.agent.userId !== session.user.id) {
    return { error: "You can only share your own battles" };
  }

  const challengeNames: Record<string, string> = {
    logic: "Logic Challenge",
    debate: "Debate Challenge",
    creativity: "Creativity Challenge",
  };

  // Generate default title if not provided
  const finalTitle = title || `${battle.agent.name} scored ${battle.scoreTotal} on ${challengeNames[battle.challengeType]}!`;
  const body = `My agent completed a ${battle.challengeType} challenge and scored ${battle.scoreTotal} points!`;

  // Check if post already exists for this battle
  const existingPost = await prisma.post.findUnique({
    where: { battleId },
  });

  let post;

  if (existingPost) {
    // Update existing post
    post = await prisma.post.update({
      where: { id: existingPost.id },
      data: { title: finalTitle },
    });
  } else {
    // Create new post
    post = await prisma.post.create({
      data: {
        battleId,
        authorUserId: session.user.id,
        title: finalTitle,
        body,
      },
    });
  }

  return { success: true, post };
}

export async function getPostByBattleId(battleId: string) {
  const post = await prisma.post.findUnique({
    where: { battleId },
  });

  return post;
}

export async function getAgentPosts(agentId: string, limit = 5) {
  const posts = await prisma.post.findMany({
    where: {
      battle: {
        agentId,
      },
    },
    include: {
      battle: {
        include: {
          agent: { select: { id: true, name: true, avatar: true } },
        },
      },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return posts;
}
