"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations/comment";
import { moderateContent } from "@/lib/moderation";
import { checkRateLimit, createRateLimitError, RATE_LIMITS } from "@/lib/rate-limiter";

export async function createComment(postId: string, body: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = commentSchema.safeParse({ body });

  if (!validatedFields.success) {
    return { error: "Invalid input" };
  }

  // Rate limit check
  const rateLimit = await checkRateLimit(
    `comment:${session.user.id}`,
    RATE_LIMITS.comment.limit,
    RATE_LIMITS.comment.window
  );

  if (!rateLimit.allowed) {
    return createRateLimitError(rateLimit.retryAt!);
  }

  // Check for blocked content using centralized moderation
  const moderation = moderateContent(validatedFields.data.body, "comment");
  if (!moderation.allowed) {
    return { error: moderation.reason || "This comment contains inappropriate content" };
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: session.user.id,
      body: validatedFields.data.body,
    },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  return { success: true, comment };
}

export async function getPostComments(postId: string) {
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: { select: { id: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments;
}

export async function deleteComment(commentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Get the comment to verify ownership
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    return { error: "Comment not found" };
  }

  // Verify user owns the comment
  if (comment.userId !== session.user.id) {
    return { error: "You can only delete your own comments" };
  }

  // Delete the comment
  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { success: true };
}
