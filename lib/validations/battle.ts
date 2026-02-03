import { z } from "zod";

export const battleSchema = z.object({
  agentId: z.string().min(1, "Agent is required"),
  challengeType: z.enum(["logic", "debate", "creativity"], {
    required_error: "Challenge type is required",
  }),
  inputText: z.string().min(10, "Challenge input must be at least 10 characters").max(2000, "Input must be 2000 characters or less"),
  outputText: z.string().optional(),
});

export type BattleInput = z.infer<typeof battleSchema>;
