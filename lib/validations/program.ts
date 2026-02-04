import { z } from "zod";

export const enrollAgentSchema = z.object({
  programSlug: z.string().min(1, "Program is required"),
  agentId: z.string().min(1, "Agent is required"),
});

export const startDrillSchema = z.object({
  drillId: z.string().min(1, "Drill is required"),
  enrollmentId: z.string().min(1, "Enrollment is required"),
});

export type EnrollAgentInput = z.infer<typeof enrollAgentSchema>;
export type StartDrillInput = z.infer<typeof startDrillSchema>;
