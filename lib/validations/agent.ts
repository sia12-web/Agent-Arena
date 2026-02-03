import { z } from "zod";

const SKILL_OPTIONS = ["Strategist", "Creator", "Analyst", "Diplomat", "Solver"] as const;

export const agentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(50, "Name must be 50 characters or less"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be 500 characters or less"),
  avatar: z.string().default("🤖"),
  traits: z.object({
    analytical: z.number().min(0).max(100),
    calm: z.number().min(0).max(100),
    fast: z.number().min(0).max(100),
  }),
  skills: z.array(z.enum(SKILL_OPTIONS)).min(1).max(3),
  prompt: z.string().min(20, "Prompt must be at least 20 characters").max(1000, "Prompt must be 1000 characters or less"),
});

export type AgentInput = z.infer<typeof agentSchema>;
