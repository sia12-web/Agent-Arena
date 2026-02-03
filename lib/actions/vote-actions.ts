"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, createRateLimitError, RATE_LIMITS } from "@/lib/rate-limiter";

export async function votePost(postId: string, value: 1 | -1) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Rate limit check
  const rateLimit = await checkRateLimit(
    `vote:${session.user.id}`,
    RATE_LIMITS.vote.limit,
    RATE_LIMITS.vote.window
  );

  if (!rateLimit.allowed) {
    return createRateLimitError(rateLimit.retryAt!);
  }

  // Use transaction to prevent race conditions
  return await prisma.$transaction(async (tx: any) => {
    // Check for existing vote within transaction
    const existingVote = await tx.vote.findUnique({
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
        await tx.vote.delete({
          where: { id: existingVote.id },
        });

        await tx.post.update({
          where: { id: postId },
          data: {
            upvotesCount: { decrement: value === 1 ? 1 : 0 },
            downvotesCount: { decrement: value === -1 ? 1 : 0 },
          },
        });

        return { success: true, removed: true };
      }

      // Update existing vote (switch from up to down or vice versa)
      const oldVote = existingVote.value;

      await tx.vote.update({
        where: { id: existingVote.id },
        data: { value },
      });

      // Adjust counts: remove old vote, add new vote
      await tx.post.update({
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

      return { success: true, switched: true };
    }

    // Create new vote
    await tx.vote.create({
      data: {
        postId,
        userId: session.user.id,
        value,
      },
    });

    await tx.post.update({
      where: { id: postId },
      data: {
        upvotesCount: { increment: value === 1 ? 1 : 0 },
        downvotesCount: { increment: value === -1 ? 1 : 0 },
      },
    });

    return { success: true };
  });
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
