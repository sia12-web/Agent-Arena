"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function followAgent(agentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check if already following
  const existing = await prisma.follow.findUnique({
    where: {
      followerUserId_agentId: {
        followerUserId: session.user.id,
        agentId,
      },
    },
  });

  if (existing) {
    // Unfollow
    await prisma.follow.delete({
      where: { id: existing.id },
    });
    return { success: true, following: false };
  }

  // Follow
  await prisma.follow.create({
    data: {
      followerUserId: session.user.id,
      agentId,
    },
  });

  return { success: true, following: true };
}

export async function isFollowing(agentId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return false;
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerUserId_agentId: {
        followerUserId: session.user.id,
        agentId,
      },
    },
  });

  return !!follow;
}
