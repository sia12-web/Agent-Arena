"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, createRateLimitError, RATE_LIMITS } from "@/lib/rate-limiter";

// Get all available programs (public)
export async function getPrograms() {
  const programs = await prisma.program.findMany({
    include: {
      drills: {
        orderBy: { orderIndex: "asc" },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return programs;
}

// Get single program by slug
export async function getProgramBySlug(slug: string) {
  const program = await prisma.program.findUnique({
    where: { slug },
    include: {
      drills: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return program;
}

// Enroll agent in program
export async function enrollAgentInProgram(data: {
  programSlug: string;
  agentId: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Rate limit enrollment creation
  const rateLimit = await checkRateLimit(
    `programEnroll:${session.user.id}`,
    RATE_LIMITS.programEnroll.limit,
    RATE_LIMITS.programEnroll.window
  );

  if (!rateLimit.allowed) {
    return createRateLimitError(rateLimit.retryAt!);
  }

  // Verify program exists
  const program = await prisma.program.findUnique({
    where: { slug: data.programSlug },
  });

  if (!program) {
    return { error: "Program not found" };
  }

  // Verify agent ownership
  const agent = await prisma.agent.findUnique({
    where: { id: data.agentId },
  });

  if (!agent || agent.userId !== session.user.id) {
    return { error: "Agent not found or unauthorized" };
  }

  // Check for existing enrollment
  const existing = await prisma.programEnrollment.findUnique({
    where: {
      programId_agentId: {
        programId: program.id,
        agentId: data.agentId,
      },
    },
  });

  if (existing) {
    return { enrollment: existing, success: true };
  }

  // Create enrollment
  const enrollment = await prisma.programEnrollment.create({
    data: {
      programId: program.id,
      agentId: data.agentId,
      userId: session.user.id,
    },
    include: {
      program: true,
      agent: true,
    },
  });

  return { success: true, enrollment };
}

// Get user's enrollments
export async function getMyEnrollments() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  const enrollments = await prisma.programEnrollment.findMany({
    where: { userId: session.user.id },
    include: {
      program: {
        include: {
          drills: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      agent: {
        select: {
          id: true,
          name: true,
          avatar: true,
          rating: true,
        },
      },
      completions: {
        include: {
          drill: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate progress percentage
  return enrollments.map((enrollment: any) => {
    const totalDrills = enrollment.program.drills.length;
    const completedDrills = enrollment.completions.length;
    const progressPercent =
      totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0;

    return {
      ...enrollment,
      progressPercent,
      totalDrills,
      completedDrills,
    };
  });
}

// Get enrollment with next drill
export async function getEnrollmentForTraining(enrollmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const enrollment = await prisma.programEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      program: {
        include: {
          drills: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      agent: true,
      completions: {
        include: {
          drill: true,
        },
      },
    },
  });

  if (!enrollment) {
    return { error: "Enrollment not found" };
  }

  // Verify ownership
  if (enrollment.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  // Find next incomplete drill
  const completedDrillIds = new Set(enrollment.completions.map((c) => c.drillId));
  const nextDrill = enrollment.program.drills.find(
    (d) => !completedDrillIds.has(d.id)
  );

  const totalDrills = enrollment.program.drills.length;
  const completedDrills = enrollment.completions.length;
  const progressPercent = Math.round((completedDrills / totalDrills) * 100);

  return {
    enrollment,
    nextDrill,
    progressPercent,
    isComplete: !nextDrill,
  };
}

// Start drill (returns pre-filled data for /arena)
export async function startDrill(drillId: string, enrollmentId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Rate limit drill starts
  const rateLimit = await checkRateLimit(
    `drillStart:${session.user.id}`,
    RATE_LIMITS.drillStart.limit,
    RATE_LIMITS.drillStart.window
  );

  if (!rateLimit.allowed) {
    return createRateLimitError(rateLimit.retryAt!);
  }

  // Verify enrollment ownership
  const enrollment = await prisma.programEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      program: {
        include: {
          drills: true,
        },
      },
      completions: true,
    },
  });

  if (!enrollment || enrollment.userId !== session.user.id) {
    return { error: "Unauthorized enrollment" };
  }

  // Verify drill belongs to program
  const drill = await prisma.programDrill.findUnique({
    where: { id: drillId },
  });

  if (!drill || drill.programId !== enrollment.programId) {
    return { error: "Drill not found in this program" };
  }

  // Check if already completed
  const alreadyCompleted = enrollment.completions.some(
    (c) => c.drillId === drillId
  );
  if (alreadyCompleted) {
    return { error: "Drill already completed" };
  }

  // Return data for arena pre-fill
  return {
    success: true,
    data: {
      agentId: enrollment.agentId,
      challengeType: enrollment.program.challengeType as
        | "logic"
        | "debate"
        | "creativity",
      inputText: drill.presetInput,
      programId: enrollment.programId,
      drillId: drill.id,
      enrollmentId: enrollment.id,
    },
  };
}

// Mark drill complete (called after battle creation)
export async function completeDrill(data: {
  enrollmentId: string;
  drillId: string;
  battleId: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Verify enrollment ownership
  const enrollment = await prisma.programEnrollment.findUnique({
    where: { id: data.enrollmentId },
  });

  if (!enrollment || enrollment.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  // Verify battle ownership
  const battle = await prisma.battle.findUnique({
    where: { id: data.battleId },
  });

  if (!battle) {
    return { error: "Battle not found" };
  }

  // Create completion record
  const completion = await prisma.drillCompletion.create({
    data: {
      enrollmentId: data.enrollmentId,
      drillId: data.drillId,
      battleId: data.battleId,
    },
    include: {
      drill: true,
    },
  });

  // Check if program is complete
  const allCompletions = await prisma.drillCompletion.findMany({
    where: { enrollmentId: data.enrollmentId },
  });

  const program = await prisma.program.findUnique({
    where: { id: enrollment.programId },
    include: { drills: true },
  });

  const isProgramComplete =
    program && allCompletions.length === program.drills.length;

  if (isProgramComplete && enrollment) {
    await prisma.programEnrollment.update({
      where: { id: data.enrollmentId },
      data: { completedAt: new Date() },
    });
  }

  // Update battle with program context
  await prisma.battle.update({
    where: { id: data.battleId },
    data: {
      programId: enrollment.programId,
      drillId: data.drillId,
    },
  });

  return {
    success: true,
    completion,
    isProgramComplete,
  };
}

// Get agent's program progress
export async function getAgentProgramProgress(agentId: string) {
  const enrollments = await prisma.programEnrollment.findMany({
    where: { agentId },
    include: {
      program: {
        include: {
          drills: true,
        },
      },
      completions: true,
    },
  });

  return enrollments.map((e: any) => {
    const progress = Math.round(
      (e.completions.length / e.program.drills.length) * 100
    );
    return {
      programSlug: e.program.slug,
      programTitle: e.program.title,
      progress,
      isComplete: e.completedAt !== null,
    };
  });
}
