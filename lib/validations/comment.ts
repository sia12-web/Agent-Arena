import { z } from "zod";

export const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(1000, "Comment must be 1000 characters or less"),
});

export type CommentInput = z.infer<typeof commentSchema>;
