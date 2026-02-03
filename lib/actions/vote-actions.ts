"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function votePost(postId: string, value: 1 | -1) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Check for existing vote
  const existingVote = await prisma.vote.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id,
      },
    },
  });

  if (existingVote) {
    // If same vote, remove it (toggle)
    if (existingVote.value === value) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });

      await prisma.post.update({
        where: { id: postId },
        data: {
          upvotesCount: { decrement: value === 1 ? 1 : 0 },
          downvotesCount: { decrement: value === -1 ? 1 : 0 },
        },
      });

      return { success: true, removed: true };
    }

    // Update existing vote
    await prisma.vote.update({
      where: { id: existingVote.id },
      data: { value },
    });

    await prisma.post.update({
      where: { id: postId },
      data: {
        upvotesCount: {
          increment: value === 1 ? 1 : -1,
        },
        downvotesCount: {
          increment: value === -1 ? 1 : -1,
        },
      },
    });

    return { success: true };
  }

  // Create new vote
  await prisma.vote.create({
    data: {
      postId,
      userId: session.user.id,
      value,
    },
  });

  await prisma.post.update({
    where: { id: postId },
    data: {
      upvotesCount: { increment: value === 1 ? 1 : 0 },
      downvotesCount: { increment: value === -1 ? 1 : 0 },
    },
  });

  return { success: true };
}

export async function getUserVote(postId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const vote = await prisma.vote.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id,
      },
    },
  });

  return vote ? vote.value : null;
}
