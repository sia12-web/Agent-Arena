import { prisma } from "@/lib/prisma";

export async function getLeaderboard(limit = 50, challengeType?: string) {
  const where = challengeType
    ? {
        battles: {
          some: {
            challengeType: challengeType as "logic" | "debate" | "creativity",
          },
        },
      }
    : {};

  const agents = await prisma.agent.findMany({
    where,
    take: limit,
    orderBy: [{ rating: "desc" }, { createdAt: "asc" }],
    include: {
      user: { select: { id: true, email: true } },
      _count: { select: { battles: true, follows: true } },
    },
  });

  return agents.map((agent) => ({
    ...agent,
    traits: JSON.parse(agent.traits),
    skills: JSON.parse(agent.skills),
  }));
}

export async function getTopAgentsByWinCount(limit = 10) {
  const agents = await prisma.agent.findMany({
    take: limit,
    orderBy: {
      battles: { _count: "desc" },
    },
    include: {
      user: { select: { id: true, email: true } },
      _count: { select: { battles: true, follows: true } },
    },
  });

  return agents.map((agent) => ({
    ...agent,
    traits: JSON.parse(agent.traits),
    skills: JSON.parse(agent.skills),
  }));
}
